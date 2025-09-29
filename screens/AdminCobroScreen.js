import React, { useState, useEffect, useContext } from 'react';
import { Box, VStack, HStack, Button, Text, Divider, Select, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator } from '@gluestack-ui/themed';
import { ScrollView, TextInput, TouchableOpacity } from 'react-native';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute } from '@react-navigation/native';
import { getPaymentMethods, registerPayment, approveSale } from '../services/api';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';

export default function AdminCobroScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { venta, client, products, total, paymentType, currency } = route.params;
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [paymentMethods, setPaymentMethods] = useState([]);
  // Si viene paymentType (del cajero), usarlo como valor inicial
  const [paymentMethod, setPaymentMethod] = useState(paymentType || '');
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [openPopoverIdx, setOpenPopoverIdx] = useState(null); // Popover removed
  const [paymentMethodsError, setPaymentMethodsError] = useState(false);
  const [montoRecibido, setMontoRecibido] = useState('');

  const fetchMethods = async () => {
    setPaymentMethodsError(false);
    try {
      const methods = await getPaymentMethods();
      setPaymentMethods(Array.isArray(methods) ? methods : (methods?.methods || []));
    } catch {
      setPaymentMethodsError(true);
    }
  };
  useEffect(() => {
    fetchMethods();
  }, []);

  const vuelto = () => {
    const recibido = Number(montoRecibido) || 0;
    const totalNum = Number(total) || 0;
    return recibido > totalNum ? (recibido - totalNum).toFixed(2) : '';
  };

  // Estado para evitar doble envío
  const [submitted, setSubmitted] = useState(false);

  const handleCobrar = async () => {
    if (loading || submitted) return; // Protección doble
    // Si el admin no selecciona método de pago, usar el que viene de paymentType
    const metodoFinal = paymentMethod || paymentType || '';
    const recibido = Number(montoRecibido) || 0;
    const totalNum = Number(total) || 0;
    if (!metodoFinal || !montoRecibido) {
      Toast.show({ type: 'error', text1: 'Completa todos los campos' });
      return;
    }
    if (recibido < totalNum) {
      Toast.show({ type: 'error', text1: 'El monto recibido no puede ser menor al total a pagar.' });
      return;
    }
    setLoading(true);
    setSubmitted(true);
    try {
      console.log('[DEBUG] Iniciando registro de pago y aprobación', { venta, metodoFinal, recibido });
      // Registrar el pago (esto ya cambia el estado a 'paid')
      const pagoResp = await registerPayment({
        sale: venta.id,
        payment_method: metodoFinal,
        paid_amount: recibido
      }, venta.access);
      console.log('[DEBUG] Pago registrado:', pagoResp);
      Toast.show({ type: 'success', text1: 'Venta cobrada correctamente' });
      navigation.replace('ResumenVenta', {
        venta: { ...venta, status: 'paid', payment_method: metodoFinal },
        client,
        products,
        total,
        paymentType: metodoFinal,
        currency: currency || 'USD',
        paymentMethods,
      });
    } catch (e) {
      console.log('[DEBUG] Error en cobro/approval:', e, e?.response || e?.message);
      let errorMsg = e?.message || 'No se pudo cobrar la venta.';
      if (e?.response && typeof e.response === 'object') {
        errorMsg = JSON.stringify(e.response);
      }
      Toast.show({ type: 'error', text1: 'Error', text2: errorMsg });
      setSubmitted(false); // Permitir reintentar si hay error
    }
    setLoading(false);
  };

  return (
    <Box flex={1} bg="#fff">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 56, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Text fontSize={22} fontWeight="bold" mb={12} color="#000">Resumen de Operación</Text>
        <Box bg="#f5f6fa" borderRadius={12} p={16} mb={16}>
          <Text fontWeight="bold" color="#111" mb={4}>Cliente</Text>
          <VStack mb={8} space="xs">
            <Text><Text fontWeight="bold">Nombre:</Text> {client?.first_name || client?.nombre || ''} {client?.last_name || ''}</Text>
            {client?.identity_card && (
              <Text><Text fontWeight="bold">Cédula:</Text> {client.identity_card}</Text>
            )}
            {client?.rif && (
              <Text><Text fontWeight="bold">RIF:</Text> {client.rif}</Text>
            )}
            {client?.client_type && (
              <Text><Text fontWeight="bold">Tipo de cliente:</Text> {client.client_type}</Text>
            )}
            {client?.business_name && (
              <Text><Text fontWeight="bold">Razón social:</Text> {client.business_name}</Text>
            )}
            {(client?.contact_phone || client?.telefono || client?.phone) && (
              <Text>
                <Text fontWeight="bold">Teléfono:</Text> {client.prefix?.code ? `${client.prefix.code}-` : ''}{client.contact_phone || client.telefono || client.phone}
              </Text>
            )}
            {client?.email && (
              <Text><Text fontWeight="bold">Correo:</Text> {client.email}</Text>
            )}
            {(client?.address || client?.direccion) && (
              <Text><Text fontWeight="bold">Dirección:</Text> {client.address || client.direccion}</Text>
            )}
          </VStack>
          <Divider my={8} />
          <Text fontWeight="bold" color="#111" mb={4}>Productos</Text>
          <VStack space="sm">
            {products.map((prod, idx) => {
              const qty = prod.qty || prod.quantity || prod.product_quantity || 1;
              // Buscar nombre de producto en todas las variantes posibles
              const productName = prod.name || prod.product_name || prod.nombre || prod.product?.name || prod.product?.product_name || prod.product?.nombre || '';
              // Buscar precio unitario en todas las variantes posibles
              const price = Number(
                prod.sale_price_at_time_of_sale ??
                prod.sale_price ??
                prod.price ??
                prod.unit_price ??
                (prod.product && (prod.product.sale_price ?? prod.product.price ?? prod.product.unit_price)) ??
                0
              );
              return (
                <HStack key={idx} justifyContent="space-between" alignItems="center">
                  {/* Columna: Nombre del producto (multilínea, sin popover) */}
                  <Box flex={2} maxWidth={180}>
                    <Text
                      style={{ maxWidth: 180 }}
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      {productName}
                    </Text>
                  </Box>
                  {/* Columna: Cantidad */}
                  <Box flex={1} alignItems="center">
                    <Text fontWeight="bold" color="#222">x{qty}</Text>
                  </Box>
                  {/* Columna: Precios */}
                  <VStack alignItems="flex-end" flex={2}>
                    <Text fontSize={13} color="#888">Unit: ${price.toFixed(2)}</Text>
                    <Text fontWeight="bold">${(price * qty).toFixed(2)}</Text>
                  </VStack>
                </HStack>
              );
            })}
          </VStack>
          <Divider my={8} />
          {/* Resumen compacto igual a CheckoutScreen */}
          <HStack justifyContent="space-between" mb={2}>
            <Text color="#000" fontWeight="bold">Items / Productos</Text>
            <Text color="#222">{products.reduce((acc, p) => acc + (p.qty || p.quantity || 1), 0)} / {products.length}</Text>
          </HStack>
          <HStack justifyContent="space-between" mb={2}>
            <Text color="#000" fontWeight="bold">Subtotal</Text>
            <Text color="#222">${total && total.toFixed ? total.toFixed(2) : Number(total).toFixed(2)}</Text>
          </HStack>
          <HStack justifyContent="space-between" mt={2}>
            <Text color="#000" fontWeight="bold" fontSize={18}>Total</Text>
            <Text color="#222" fontWeight="bold" fontSize={18}>${total && total.toFixed ? total.toFixed(2) : Number(total).toFixed(2)}</Text>
          </HStack>
        </Box>
        <Box mb={2}>
          <Text color="#222" mb={1} style={{ fontWeight: 'bold' }}>Método de pago</Text>
          <TouchableOpacity
            style={{ width: '100%', borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#fff', height: 44, minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 0, marginBottom: 8 }}
            onPress={() => setShowPaymentSheet(true)}
            disabled={paymentMethods.length === 0}
          >
            <Text style={{ color: paymentMethod ? '#222' : '#888', fontSize: 16 }}>
              {paymentMethod
                ? (paymentMethods.find(pm => pm.id === paymentMethod)?.name || paymentMethod)
                : 'Selecciona método de pago'}
            </Text>
          </TouchableOpacity>
          {/* Bottom sheet tipo SelectPortal para seleccionar método de pago */}
          <SelectPortal isOpen={showPaymentSheet} onClose={() => setShowPaymentSheet(false)}>
            <SelectBackdrop onPress={() => setShowPaymentSheet(false)} />
            <SelectContent style={{ backgroundColor: '#fff', borderRadius: 16, width: '100%', maxWidth: '100%', maxHeight: '80%', minHeight: '30%', paddingBottom: 24 }}>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>
              <Box style={{ width: '100%', maxWidth: '100%', paddingBottom: 24 }}>
                <Text fontWeight="bold" fontSize={18} mb={12}>Selecciona método de pago</Text>
                {paymentMethods.length === 0 ? (
                  <Text color="#f00" fontWeight="bold" p={12} textAlign="center">
                    No hay métodos de pago disponibles. Contacte al administrador.
                  </Text>
                ) : (
                  paymentMethods.map((pm) => (
                    <TouchableOpacity
                      key={pm.id}
                      style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                      onPress={() => {
                        setPaymentMethod(pm.id);
                        setShowPaymentSheet(false);
                      }}
                    >
                      <Text style={{ fontSize: 16, color: '#222' }}>{pm.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
              </Box>
            </SelectContent>
          </SelectPortal>
        </Box>
        {paymentMethodsError && (
          <Button
            variant="outline"
            borderColor="#f00"
            mt={-8}
            mb={12}
            borderRadius={8}
            style={{ paddingVertical: 10, minHeight: 40, width: '100%', borderWidth: 1 }}
            onPress={() => {
              setPaymentMethods([]);
              setPaymentMethod('');
              fetchMethods();
            }}
          >
            <Text color="#f00" fontWeight="bold" fontSize={15} style={{ textAlign: 'center' }}>Reintentar cargar métodos de pago</Text>
          </Button>
        )}
        {/* Campo para monto recibido y vueltos solo si efectivo */}
        {(() => {
          // Detectar si el método de pago es efectivo
          const efectivoNames = ['efectivo', 'cash', 'contado'];
          const pm = paymentMethods.find(pm => pm.id === paymentMethod || pm.name === paymentMethod);
          const isEfectivo = pm && efectivoNames.some(name => (pm.name || '').toLowerCase().includes(name));
          if (!isEfectivo) return null;
          return (
            <>
              <Box mb={2}>
                <Text color="#222" mb={1} style={{ fontWeight: 'bold' }}>Monto recibido</Text>
                <TextInput
                  value={montoRecibido}
                  onChangeText={setMontoRecibido}
                  placeholder="Monto recibido"
                  keyboardType="numeric"
                  style={{ width: '100%', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, color: '#222', height: 44, minHeight: 44, paddingHorizontal: 12, paddingVertical: 0 }}
                />
              </Box>
              <Box mb={2}>
                <Text mb={1} style={{ fontWeight: 'bold', color: '#222' }}>Vueltos</Text>
                <TextInput
                  value={
                    Number.isNaN(Number(vuelto()))
                      ? ''
                      : (Number(montoRecibido) === Number(total) ? '0.00' : String(vuelto()))
                  }
                  editable={false}
                  placeholder={
                    Number(montoRecibido) < Number(total) && montoRecibido !== ''
                      ? 'El monto recibido es menor al total'
                      : 'Vueltos'
                  }
                  placeholderTextColor={
                    Number(montoRecibido) < Number(total) && montoRecibido !== ''
                      ? 'red'
                      : '#888'
                  }
                  keyboardType="numeric"
                  style={{ width: '100%', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, color: '#222', backgroundColor: '#f5f5f5', height: 44, minHeight: 44, paddingHorizontal: 12, paddingVertical: 0 }}
                />
              </Box>
            </>
          );
        })()}
        <Button
          bg="#111"
          isDisabled={
            !paymentMethod ||
            !montoRecibido ||
            loading ||
            submitted ||
            paymentMethods.length === 0 ||
            (Number(montoRecibido) < Number(total))
          }
          onPress={handleCobrar}
          borderRadius={8}
          style={{ paddingVertical: 12, minHeight: 44, width: '100%', elevation: 2, marginBottom: 8, marginTop: 92 }}
        >
          <Text color="#fff" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>{loading || submitted ? 'Procesando...' : 'Aceptar y Cobrar'}</Text>
        </Button>
        <Button
          variant="outline"
          borderColor="#111"
          borderRadius={8}
          style={{ paddingVertical: 12, minHeight: 44, width: '100%', borderWidth: 1,}}
          onPress={() => navigation.goBack()}
        >
          <Text color="#111" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>Cancelar</Text>
        </Button>
        {/* Footer visual para espacio de botones Android */}
        <Box height={48} bg="#fff" />
      </ScrollView>
      {/* Footer fijo visual para espacio de botones Android */}
      <Box position="absolute" left={0} right={0} bottom={0} height={48} bg="#fff" pointerEvents="none"></Box>
    </Box>
  );
}
