import React, { useContext, useState } from 'react';
import { Box, VStack, Text, Button, Divider, HStack } from '@gluestack-ui/themed';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { approveSale, rejectSale, deliverSale } from '../services/api';
import Toast from 'react-native-toast-message';
import { TextInput } from 'react-native';

import { ScrollView } from 'react-native';

export default function ResumenVentaScreen({ navigation, route }) {
  const { venta, client, products, total, paymentType, currency, paymentMethods, fromPendientesEntrega } = route.params;
  console.log('ResumenVentaScreen params:', route.params);
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  // Unificar lógica de fecha con la de las cards
  const rawDate = venta?.sale_date || venta?.created_at || venta?.fecha || '';
  const fecha = rawDate ? new Date(rawDate) : new Date();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [change, setChange] = useState(''); // Para input de vueltos

  // Determinar rol y estado
  const isAdmin = user?.user?.job_position?.id === 1 || user?.user?.job_position?.id === 2;
  const isCajero = user?.user?.job_position?.id === 4;
  const ventaPendiente = venta?.status === 'pending';
  const ventaPagada = venta?.status === 'paid';
  const ventaEntregada = venta?.delivery_status === 'delivered';

  // Handler para aprobar venta
  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveSale(venta.id, { change }, user.access);
      Toast.show({ type: 'success', text1: 'Venta aprobada', text2: 'La venta fue aprobada correctamente.' });
  navigation.goBack();
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'No se pudo aprobar la venta.' });
    }
    setLoading(false);
  };

  // Handler para rechazar venta
  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectSale(venta.id, user.access);
      Toast.show({ type: 'success', text1: 'Venta rechazada', text2: 'La venta fue rechazada.' });
      navigation.navigate('OrdenesPendientesEntrega');
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'No se pudo rechazar la venta.' });
    }
    setLoading(false);
  };

  // Handler para marcar como entregada
  const handleDeliver = async () => {
    if (venta.status !== 'paid') {
      let msg = 'Solo puedes marcar como entregada una venta pagada.';
      if (venta.status === 'pending') msg = 'La venta aún está pendiente de pago.';
      if (venta.status === 'rejected') msg = 'La venta fue rechazada y no puede ser entregada.';
      if (venta.status === 'cancelled') msg = 'La venta fue cancelada y no puede ser entregada.';
      Toast.show({ type: 'error', text1: 'No permitido', text2: msg });
      return;
    }
    setLoading(true);
    try {
      await deliverSale(venta.id, user.access);
      Toast.show({ type: 'success', text1: 'Venta entregada', text2: 'La venta fue marcada como entregada.' });
      navigation.reset({
        index: 0,
        routes: [{ name: 'CajeroDashboard' }],
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'No se pudo marcar como entregada.' });
    }
    setLoading(false);
  };

  return (
    <Box flex={1} bg={palette.surface}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 56, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <VStack space="md" alignItems="center" width="100%">
          <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="center" accessibilityRole="header">
            Comprobante de Operación
          </Text>
    <Text color={palette.text} fontSize={15} mb={1}>Operación N°: {venta?.id || '--'}</Text>
    <Text color={palette.text} fontSize={15} mb={1}>Fecha: {rawDate ? fecha.toLocaleString() : 'Sin fecha'}</Text>
    <Divider my={2} width="100%" />
    <Text color={palette.primary} fontWeight="bold" fontSize={16} mb={1} mt={2} accessibilityRole="header">Cliente</Text>
    <Text color={palette.text}>{client?.first_name} {client?.last_name} ({client?.id})</Text>
    {client?.identity_card && <Text color={palette.text}>Cédula: {client.identity_card}</Text>}
    {client?.contact_phone && <Text color={palette.text}>Tel: {client.prefix?.code ? `+${client.prefix.code} ` : ''}{client.contact_phone}</Text>}
    <Divider my={2} width="100%" />
    <Text color={palette.primary} fontWeight="bold" fontSize={16} mb={1} mt={2} accessibilityRole="header">Productos</Text>
    <VStack width="100%" space="xs">
          {products.map((p, idx) => {
            const qty = p.qty || p.quantity || p.product_quantity || 1;
            const productName = p.name || p.product_name || p.nombre || p.product?.name || p.product?.product_name || p.product?.nombre || '';
            const price = Number(
              p.sale_price_at_time_of_sale ??
              p.sale_price ??
              p.price ??
              p.unit_price ??
              (p.product && (p.product.sale_price ?? p.product.price ?? p.product.unit_price)) ??
              0
            );
            return (
              <HStack key={idx} justifyContent="space-between" width="100%" alignItems="center">
                <Text color={palette.text} flex={2}>{productName}</Text>
                <Text color={palette.text} flex={1} textAlign="center">x{qty}</Text>
                <VStack alignItems="flex-end" flex={2}>
                  <Text color="#888" fontSize={13}>Unit: ${price.toFixed(2)}</Text>
                  <Text color={palette.text}>${(price * qty).toFixed(2)}</Text>
                </VStack>
              </HStack>
            );
          })}
        </VStack>
        <Divider my={2} width="100%" />
        <Text color={palette.primary} fontWeight="bold" fontSize={16} mb={1} mt={2} accessibilityRole="header">Totales</Text>
        <HStack justifyContent="space-between" width="100%">
          <Text color={palette.text}>Total:</Text>
          <Text color={palette.text} fontWeight="bold">${total}</Text>
        </HStack>
        <HStack justifyContent="space-between" width="100%">
          <Text color={palette.text}>Método de pago:</Text>
            <Text color={palette.text}>{(() => {
              // Usar venta.payment.payment_method.name si existe
              if (venta?.payment?.payment_method?.name) return venta.payment.payment_method.name;
              // Usar venta.payment_method.name si existe (caso entregada)
              if (venta?.payment_method?.name) return venta.payment_method.name;
              // Usar venta.payment_method si es string (caso entregada)
              if (typeof venta?.payment_method === 'string' && venta.payment_method.trim() !== '') {
                // Buscar en paymentMethods
                if (Array.isArray(paymentMethods)) {
                  const found = paymentMethods.find(pm => String(pm.id) === String(venta.payment_method) || String(pm.value) === String(venta.payment_method));
                  if (found) return found.name;
                }
                // Fallback mostrar el string
                return venta.payment_method;
              }
              // Buscar en venta.payment_type, paymentType, o paymentMethods
              const type = venta?.payment_type || paymentType;
              if (typeof type === 'object' && type?.name) return type.name;
              if (type === 'cash') return 'Efectivo';
              if (type === 'card') return 'Tarjeta';
              if (type === 'transfer') return 'Transferencia';
              if (type === 'mobile') return 'Pago móvil';
              if (Array.isArray(paymentMethods)) {
                const found = paymentMethods.find(pm => String(pm.id) === String(type) || String(pm.value) === String(type));
                if (found) return found.name;
              }
              if (typeof type === 'string' && type.trim() !== '') return type;
              return 'No especificado';
            })()}</Text>
        </HStack>
        {/* Botón final: para admin ir a órdenes pendientes, para cajero nueva venta */}
        {!fromPendientesEntrega && (
          isAdmin ? (
            <Button mt={4} onPress={() => navigation.navigate('AdministradorDashboard', { screen: 'AdminOrdenesPendientes' })} bg={palette.primary} width="100%">
              <Text color="#fff">Ir a Órdenes Pendientes</Text>
            </Button>
          ) : (
            <Button mt={4} onPress={() => navigation.popToTop()} bg={palette.primary} width="100%">
              <Text color="#fff">Nueva Venta</Text>
            </Button>
          )
        )}
        {/* Controles para ADMIN cuando la venta está pendiente */}
        {isAdmin && ventaPendiente && (
          <Box width="100%" mt={4}>
            <Text color={palette.text} fontWeight="bold" mb={2}>Aprobar/Rechazar operación</Text>
            {/* Input para vueltos */}
            <Box mb={2}>
              <Text color={palette.text} mb={1}>Vueltos (calculado):</Text>
              <TextInput
                value={(() => {
                  const pago = Number(total) || 0;
                  const recibido = Number(change) || 0;
                  const vuelto = recibido > pago ? (recibido - pago).toFixed(2) : '';
                  return vuelto;
                })()}
                editable={false}
                placeholder="Vueltos"
                keyboardType="numeric"
                style={{ width: '100%', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, color: palette.text, backgroundColor: '#f5f5f5' }}
              />
            </Box>
            <Box mb={2}>
              <Text color={palette.text} mb={1}>Monto recibido:</Text>
              <TextInput
                value={change}
                onChangeText={setChange}
                placeholder="Monto recibido"
                keyboardType="numeric"
                style={{ width: '100%', padding: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, color: palette.text }}
              />
            </Box>
            <Button bg="#27ae60" mb={2} onPress={handleApprove} isDisabled={loading}>
              <Text color="#fff">Aprobar y registrar pago</Text>
            </Button>
            <Button bg="#e74c3c" onPress={handleReject} isDisabled={loading}>
              <Text color="#fff">Rechazar operación</Text>
            </Button>
          </Box>
        )}
        {/* Controles para CAJERO cuando la venta está pagada pero no entregada */}
        {isCajero && ventaPagada && !ventaEntregada && (
          <Box width="100%" mt={4}>
            <Button bg="#2980b9" onPress={handleDeliver} isDisabled={loading}>
              <Text color="#fff">Marcar como entregada</Text>
            </Button>
          </Box>
        )}
        </VStack>
      </ScrollView>
      {/* Footer fijo visual para espacio de botones Android */}
      <Box position="absolute" left={0} right={0} bottom={0} height={48} bg="#fff" pointerEvents="none"></Box>
    </Box>
  );
}
