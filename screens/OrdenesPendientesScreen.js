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
              <Box
                key={orden.id}
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
                  <CustomButton
                    onPress={() => openCobroModal(orden.id, orden.total_amount)}
                    backgroundColor={palette.primary}
                    textColor={palette.background}
                    isLoading={processing}
                    style={{ marginTop: 10, width: '100%' }}
                  >
                    Cobrar
                  </CustomButton>
                )}
      {/* Modal para cobrar */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={closeCobroModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 24, width: 320 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Registrar pago</Text>
            <Text style={{ marginBottom: 6 }}>Método de pago (ID):</Text>
            <TextInput
              value={paymentMethod}
              onChangeText={setPaymentMethod}
              placeholder="ID del método de pago"
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 12, padding: 8 }}
            />
            <Text style={{ marginBottom: 6 }}>Monto pagado:</Text>
            <TextInput
              value={paidAmount}
              onChangeText={setPaidAmount}
              placeholder="Monto pagado"
              keyboardType="numeric"
              style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginBottom: 16, padding: 8 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity onPress={closeCobroModal} style={{ marginRight: 16 }}>
                <Text style={{ color: '#888', fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCobrar} style={{ backgroundColor: palette.primary, borderRadius: 6, paddingVertical: 8, paddingHorizontal: 18 }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{processing ? 'Procesando...' : 'Cobrar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
                {!isAdmin && modoCobro === 'admin' && (
                  <Text color="#ff9900" mt={2} fontWeight="bold">Esperando pago del administrador...</Text>
                )}
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
