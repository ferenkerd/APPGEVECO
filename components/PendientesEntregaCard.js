import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Spinner, Pressable } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { listSalesByCajero } from '../services/api';

export default function PendientesEntregaCard() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const cajeroId = user?.user?.user_id || user?.user?.id || user?.user?.pk || user?.user?.username || user?.user?.email;
        const data = await listSalesByCajero(cajeroId, user?.access);
        // Filtrar ventas pagadas y no entregadas (igual que en OrdenesPendientesEntregaScreen)
        setVentas((data || []).filter(v => {
          const status = (v.status || '').toLowerCase();
          const delivered = v.delivered === true
            || (typeof v.delivery_status === 'string' && v.delivery_status.toLowerCase() === 'delivered')
            || (!!v.delivered_at && v.delivered_at !== 'null' && v.delivered_at !== null && v.delivered_at !== undefined && v.delivered_at !== '');
          return status === 'paid' && !delivered;
        }));
      } catch {
        setVentas([]);
      }
      setLoading(false);
    };
    if (user?.user) fetchVentas();
  }, [user]);

  if (loading) {
    return (
      <Box bg="#fffbe6" borderRadius={16} p={16} mb={16} alignItems="center" justifyContent="center">
        <Spinner size="small" />
        <Text color="#888" mt={2}>Cargando ventas pendientes...</Text>
      </Box>
    );
  }

  if (!ventas.length) {
    return null;
  }

  // Botón grande que lleva a la pantalla de órdenes por entregar
  return (
    <Box px={16} py={12}>
      <Pressable
    onPress={() => navigation.navigate('OrdenesPendientesEntrega')}
        style={{ width: '100%' }}
      >
  <Box bg="#fff" borderRadius={16} p={20} alignItems="center" justifyContent="center" shadow={2} borderWidth={2} borderColor="#111">
          <Text fontWeight="bold" fontSize={19} color="#b8860b" mb={2}>Órdenes por entregar</Text>
          <Text color="#111" fontSize={15} mb={2}>{ventas.length} venta(s) pagada(s) y no entregada(s)</Text>
          <Text color="#b8860b" fontSize={13}>Toca para ver y entregar</Text>
        </Box>
      </Pressable>
    </Box>
  );
}
