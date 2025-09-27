import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Spinner, Pressable } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { listSalesByCajero } from '../services/api';

export default function OrdenesPendientesEntregaScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]); // Siempre array
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVentas = async () => {
      setLoading(true);
      try {
        const cajeroId = user?.user?.user_id || user?.user?.id || user?.user?.pk || user?.user?.username || user?.user?.email;
        let data = await listSalesByCajero(cajeroId, user?.access);
        // Refuerzo: asegurar array
        if (!Array.isArray(data)) {
          data = [];
        }
        setVentas(data.filter(v => {
          const status = (v.status || '').toLowerCase();
          // Considerar todas las variantes de entregado
          const delivered = v.delivered === true
            || (typeof v.delivery_status === 'string' && v.delivery_status.toLowerCase() === 'delivered')
            || (!!v.delivered_at && v.delivered_at !== 'null' && v.delivered_at !== null && v.delivered_at !== undefined && v.delivered_at !== '');
          return status === 'paid' && !delivered;
        }));
      } catch (error) {
        console.error('Error al cargar ventas pendientes:', error);
        setVentas([]);
      }
      setLoading(false);
    };
    if (user?.user) fetchVentas();
  }, [user]);

  if (loading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" bg="#fff">
        <Spinner size="large" />
        <Text color="#888" mt={2}>Cargando órdenes por entregar...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="#fff">
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }}>
        <Text fontWeight="bold" fontSize={22} mb={12} color="#b8860b">Órdenes por entregar</Text>
        {!Array.isArray(ventas) ? (
          <Text color="#c00" fontSize={12}>Error: ventas no es un array. Valor: {JSON.stringify(ventas)}</Text>
        ) : ventas.length === 0 ? (
          <Text color="#888">No hay ventas pagadas y no entregadas.</Text>
        ) : (
          <VStack space="md">
            {ventas.map((venta) => (
              <Pressable
                key={venta.id}
                onPress={() => navigation.navigate('ResumenVenta', {
                  venta,
                  ventaId: venta.id,
                  id: venta.id,
                  client: venta.client,
                  products: venta.details || [],
                  total: venta.total_amount,
                  paymentType: venta.payment_type,
                  currency: venta.currency,
                  paymentMethods: venta.payment_methods || [],
                  fromPendientesEntrega: true
                })}
                style={{ width: '100%' }}
              >
                <Box bg="#fffbe6" borderRadius={12} p={16} mb={4} shadow={1}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text color="#111" fontWeight="bold">Venta #{venta.id}</Text>
                    <Text color="#888">${venta.total_amount}</Text>
                  </HStack>
                  <Text color="#888" fontSize={13} mt={2}>
                    Cliente: {venta.client && typeof venta.client === 'object' ? `${venta.client.first_name || ''} ${venta.client.last_name || ''}` : (venta.client_name || venta.client || '')}
                  </Text>
                </Box>
              </Pressable>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
