import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Spinner, Pressable } from '@gluestack-ui/themed';
import { ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { listSalesByCajero } from '../services/api';

export default function OrdenesPendientesEntregaScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]); // Siempre array
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Función para cargar ventas (reutilizable)
  const fetchVentas = async () => {
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
  };

  useEffect(() => {
    setLoading(true);
    fetchVentas().finally(() => setLoading(false));
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVentas();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" bg="#fff">
        <Spinner size="large" />
        <Text color="#888" mt={2}>Cargando órdenes por entregar...</Text>
      </Box>
    );
  }


  return (
    <Box flex={1} bg="#f4f4f4">
      <Box flex={1}>
        <ScrollView
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Text fontWeight="bold" fontSize={24} mb={12} color="#111" accessibilityRole="header">
            Órdenes pendientes de entregar
          </Text>
          {!Array.isArray(ventas) ? (
            <Text color="#c00" fontSize={12}>Error: ventas no es un array. Valor: {JSON.stringify(ventas)}</Text>
          ) : ventas.length === 0 ? (
            <Box alignItems="center" mt={32}>
              <Text color="#888" fontSize={17} textAlign="center" mb={2}>
                No tienes ventas pagadas pendientes de entrega.
              </Text>
              <Text color="#111" fontSize={13} textAlign="center">
                Cuando un cliente pague, aparecerá aquí para que puedas entregarlo.
              </Text>
            </Box>
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
                  accessibilityRole="button"
                  accessibilityLabel={`Ver detalles de la venta #${venta.id}`}
                >
                  <Box bg="#fff" borderRadius={14} p={18} mb={6} shadow={2} borderWidth={1} borderColor="#111">
                    <HStack justifyContent="space-between" alignItems="center">
                      <Text color="#111" fontWeight="bold" fontSize={17}>Venta #{venta.id}</Text>
                      <Text color="#111" fontWeight="bold" fontSize={16}>${venta.total_amount}</Text>
                    </HStack>
                    <Text color="#888" fontSize={14} mt={2}>
                      Cliente: {venta.client && typeof venta.client === 'object' ? `${venta.client.first_name || ''} ${venta.client.last_name || ''}` : (venta.client_name || venta.client || '')}
                    </Text>
                    <Text color="#888" fontSize={13} mt={1}>
                      Fecha: {(() => {
                        const rawDate = venta.sale_date || venta.created_at || venta.fecha || '';
                        if (!rawDate) return 'Sin fecha';
                        const d = new Date(rawDate);
                        return isNaN(d) ? rawDate : d.toLocaleString();
                      })()}
                    </Text>
                    <Box mt={2} width="100%" alignItems="center">
                      <Pressable
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
                        bg="#111"
                        borderRadius={8}
                        px={18}
                        py={10}
                        alignItems="center"
                        justifyContent="center"
                        accessibilityLabel={`Ver y marcar como entregada venta #${venta.id}`}
                        style={{ width: '100%' }}
                      >
                        <Text color="#fff" fontWeight="bold" fontSize={14}>Ver y marcar como entregada</Text>
                      </Pressable>
                    </Box>
                  </Box>
                </Pressable>
              ))}
            </VStack>
          )}
        </ScrollView>
      </Box>
      {/* Footer fijo */}
  <Box height={48} width="100%" bg="#f4f4f4" />
    </Box>
  );
}
