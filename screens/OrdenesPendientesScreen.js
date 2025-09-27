import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Modal, View, TextInput, TouchableOpacity } from 'react-native';
import { Box, Text, VStack, Spinner, HStack, Button } from '@gluestack-ui/themed';
import { ScrollView, RefreshControl } from 'react-native';
import { CustomButton } from '../components/CustomButton';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import TabHeader from '../components/TabHeader';
import { listSales, registerPayment, getPaymentMode } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';


export default function OrdenesPendientesScreen({ navigation }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [modoCobro, setModoCobro] = useState('admin');
  // Para el modal de cobro
  const [showModal, setShowModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

  // userData debe contener todos los datos del usuario autenticado
  const userData = user?.user ? user.user : user || {};
  console.log('[DEBUG] userData:', userData);
  // Admin: job_position === 2
  const isAdmin = userData.job_position === 2;
  // Cajero: job_position === 4
  const cashierId = userData.job_position === 4 ? userData.id : null;

  const fetchOrdenes = async () => {
    setLoading(true);
    setError(null);
    try {
      const modo = await getPaymentMode(user?.access);
      setModoCobro(modo?.mode || 'admin');
      let sales = await listSales('pending', user?.access);
      if (isAdmin) {
        setOrdenes(sales);
      } else {
        const filtered = sales.filter(s => s.cashier?.id === user?.user?.id);
        setOrdenes(filtered);
      }
    } catch (e) {
      setError('No se pudieron cargar las órdenes pendientes.');
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrdenes();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrdenes();
    setRefreshing(false);
  };

  // Abre el modal para cobrar
  const openCobroModal = (ordenId, total) => {
    setSelectedOrderId(ordenId);
    setPaidAmount(total ? String(total) : '');
    setShowModal(true);
  };

  // Cierra el modal
  const closeCobroModal = () => {
    setShowModal(false);
    setSelectedOrderId(null);
    setPaymentMethod('');
    setPaidAmount('');
  };

  // Realiza el cobro con los datos del modal
  const handleCobrar = async () => {
    if (!selectedOrderId || !paymentMethod || !paidAmount) {
      setError('Debes completar todos los campos de cobro.');
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const payload = {
        sale: selectedOrderId,
        payment_method: paymentMethod,
        paid_amount: parseFloat(paidAmount)
      };
      await registerPayment(payload, user?.access);
      await fetchOrdenes();
      closeCobroModal();
    } catch (e) {
      setError('No se pudo procesar el pago.');
    }
    setProcessing(false);
  };

  return (
    <Box flex={1} bg={palette.surface}>
      <TabHeader title="Órdenes pendientes" showMenu={false} hideMenu />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <Text fontSize={22} fontWeight="bold" mb={12} color={palette.text}>Órdenes pendientes</Text>
        <Text color={palette.textSecondary} mb={4}>
          {isAdmin
            ? 'Aquí puedes ver y cobrar todas las órdenes pendientes de todos los cajeros.'
            : 'Estas son tus órdenes pendientes. Solo el administrador puede procesar el pago.'}
        </Text>

        {error && <Text color="#ff4444" mb={2}>{error}</Text>}
        {loading ? (
          <Spinner size="large" />
        ) : ordenes.length === 0 ? (
          <Text color={palette.textSecondary}>No hay órdenes pendientes.</Text>
        ) : (
          <VStack space="md">
            {ordenes.map((orden) => (
              <TouchableOpacity
                key={orden.id}
                onPress={() => navigation.navigate('AdminCobroScreen', {
                  venta: orden,
                  client: orden.client,
                  products: orden.details || [],
                  total: orden.total_amount,
                  paymentType: orden.payment_method || '',
                  currency: 'USD',
                })}
                activeOpacity={0.8}
              >
                <Box
                  bg={palette.card || '#fff'}
                  borderRadius={16}
                  shadow={1}
                  p={16}
                  mb={12}
                  borderWidth={1}
                  borderColor={palette.border}
                >
                  <HStack justifyContent="space-between" alignItems="center" mb={2}>
                    <Text fontWeight="bold" fontSize={15} color={palette.text}>Operación #{orden.id}</Text>
                    <Text fontSize={13} color={palette.textSecondary}>
                      Cajero: {orden.cashier?.username || (typeof orden.cashier === 'string' ? orden.cashier : 'N/A')}
                    </Text>
                  </HStack>
                  <Text fontSize={16} color={palette.text} mb={1}>
                    Cliente: {orden.client?.first_name || ''} {orden.client?.last_name || ''}
                  </Text>
                  <Text fontSize={15} color={palette.textSecondary} mb={1}>Total: ${orden.total_amount}</Text>
                  <Text fontSize={13} color={palette.textSecondary} mb={1}>
                    Fecha: {orden.sale_date ? new Date(orden.sale_date).toLocaleString() : (orden.created_at || '')}
                  </Text>
                  {isAdmin && modoCobro === 'admin' && (
                    <Text color={palette.primary} fontWeight="bold" mt={2}>Toca para cobrar y aprobar</Text>
                  )}
                  {!isAdmin && modoCobro === 'admin' && (
                    <Text color="#ff9900" mt={2} fontWeight="bold">Esperando pago del administrador...</Text>
                  )}
                </Box>
              </TouchableOpacity>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
