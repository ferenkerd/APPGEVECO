  // Estado para modal de selección de método de pago (asegurar que existe)

import React from 'react';
import { Box, VStack, HStack, Button, Input, Text, Divider, Popover } from '@gluestack-ui/themed';
import { ScrollView, TextInput, Modal, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { createSale, registerPayment, getPaymentMode, getPaymentMethods } from '../services/api';
import { Select, SelectTrigger, SelectItem, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator } from '@gluestack-ui/themed';

// Recibe los datos de productos, cliente y total por params
export default function CheckoutScreen() {
  // Estado para el monto recibido (solo para efectivo)
  // Detectar si el método de pago es efectivo
  const isEfectivo = () => {
    if (!paymentMethod) return false;
    const efectivoNames = ['efectivo', 'cash', 'contado'];
    const pm = paymentMethods.find(pm => pm.id === paymentMethod || pm.name === paymentMethod);
    if (!pm) return false;
    return efectivoNames.some(name => (pm.name || '').toLowerCase().includes(name));
  };

  const vuelto = () => {
    const recibido = Number(receivedAmount) || 0;
    const totalNum = Number(total) - Number(discount || 0);
    return recibido > totalNum ? (recibido - totalNum).toFixed(2) : '';
  };
  // Estado para controlar el popover abierto
  const [openPopoverIdx, setOpenPopoverIdx] = React.useState(null);
  // Estado para el botón de enviar operación (press and hold)
  const [isPressingEnviar, setIsPressingEnviar] = React.useState(false);
  const [pressCountEnviar, setPressCountEnviar] = React.useState(3);
  // Métodos de pago dinámicos
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedProducts = [], selectedClient = null, total = 0, discount = 0 } = route.params || {};
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState('');
  const { user } = useAuth();
  const [showPaymentSheet, setShowPaymentSheet] = React.useState(false);
  const [receivedAmount, setReceivedAmount] = React.useState('');

  // Estado para error de métodos de pago
  const [paymentMethodsError, setPaymentMethodsError] = React.useState(false);

  // Función para cargar métodos de pago
  const fetchPaymentMethods = async () => {
    setPaymentMethodsError(false);
    if (!user?.access) {
      return;
    }
    try {
      const methods = await getPaymentMethods(user?.access);
      setPaymentMethods(Array.isArray(methods) ? methods : (methods?.methods || []));
    } catch {
      setPaymentMethodsError(true);
    }
  };

  // useEffect para cargar métodos de pago y modo de pago
  React.useEffect(() => {
    if (user?.access) fetchPaymentMethods();
    const fetchMode = async () => {
      try {
        const mode = await getPaymentMode(user?.access);
        setPaymentMode(mode?.mode || '');
      } catch {}
    };
    fetchMode();
  }, [user]);

  // Limpia el carrito (puedes adaptar según tu lógica global)
  const clearCart = () => {
    // Si tienes contexto global de carrito, aquí lo limpias
    // Si no, puedes hacerlo al volver a la pantalla de productos
  };

  // Lógica de crear venta y pago (directa o pendiente según modo de cobro)
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const saleBody = {
        client_id: selectedClient.id,
        total_amount: total,
        status: paymentMode === 'admin' ? 'pending' : 'paid',
        details_input: selectedProducts.map(prod => ({
          product: prod.id,
          product_quantity: prod.qty || prod.quantity || 1,
          sale_price_at_time_of_sale: Number(prod.sale_price || prod.price || 0),
          applied_discount: 0
        }))
      };
      console.log('Body que se enviará a /sales/:', saleBody);
      const sale = await createSale(saleBody, user?.access);
      if (paymentMode === 'admin') {
        Toast.show({ type: 'success', text1: 'Orden pendiente creada', text2: 'La orden fue registrada correctamente.' });
        clearCart();
        navigation.replace('ConfirmacionOperacion');
      } else {
        await registerPayment({
          sale: sale.id,
          payment_method: paymentMethod,
          paid_amount: total
        }, user?.access);
        Toast.show({ type: 'success', text1: 'Operación registrada', text2: 'El pago se realizó correctamente.' });
        clearCart();
        navigation.replace('ResumenVenta', {
          venta: sale,
          client: selectedClient,
          products: selectedProducts,
          total,
          paymentType: paymentMethod,
          currency: 'USD',
          paymentMethods,
        });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'No se pudo registrar la operación.' });
    }
    setLoading(false);
  };

  return (
    <Box flex={1} bg="#fff">
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, paddingBottom: 56, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Text fontSize={22} fontWeight="bold" mb={12} color="#000">Resumen de Operación</Text>
          {/* Tarjeta de resumen similar a AgregarProductosScreen */}
          <Box bg="#f5f6fa" borderRadius={12} p={16} mb={16}>
            {/* Cliente */}
            <Text fontWeight="bold" color="#111" mb={4}>Cliente</Text>
            {selectedClient ? (
              <VStack mb={8} space="xs">
                <Text><Text fontWeight="bold">Nombre:</Text> {selectedClient.first_name || selectedClient.nombre || ''} {selectedClient.last_name || ''}</Text>
                {selectedClient.identity_card && (
                  <Text><Text fontWeight="bold">Cédula:</Text> {selectedClient.identity_card}</Text>
                )}
                {selectedClient.contact_phone && (
                  <Text>
                    <Text fontWeight="bold">Teléfono:</Text> {selectedClient.prefix && selectedClient.prefix.code ? `${selectedClient.prefix.code}-` : ''}{selectedClient.contact_phone}
                  </Text>
                )}
                {selectedClient.address && (
                  <Text><Text fontWeight="bold">Dirección:</Text> {selectedClient.address}</Text>
                )}
              </VStack>
            ) : (
              <Text mb={8}>No seleccionado</Text>
            )}
            <Divider my={8} />
            {/* Productos con precio unitario y total */}
            <Text fontWeight="bold" color="#111" mb={4}>Productos</Text>
            <VStack space="sm">
              {selectedProducts.map((prod, idx) => {
                const qty = prod.qty || prod.quantity || 1;
                const price = Number(prod.sale_price || prod.price || 0);
                return (
                  <HStack key={idx} justifyContent="space-between" alignItems="center">
                    {/* Columna: Nombre del producto (multilínea) */}
                    <Box flex={2} maxWidth={180}>
                      <Text
                        style={{ maxWidth: 180, flexWrap: 'wrap' }}
                        numberOfLines={3}
                        ellipsizeMode="tail"
                      >
                        {prod.name}
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
            {/* Resumen compacto igual a AgregarProductosScreen, al fondo */}
            <HStack justifyContent="space-between" mb={2}>
              <Text color="#000" fontWeight="bold">Items / Productos</Text>
              <Text color="#222">{selectedProducts.reduce((acc, p) => acc + (p.qty || p.quantity || 1), 0)} / {selectedProducts.length}</Text>
            </HStack>
            <HStack justifyContent="space-between" mb={2}>
              <Text color="#000" fontWeight="bold">Subtotal</Text>
              <Text color="#222">${total.toFixed ? total.toFixed(2) : Number(total).toFixed(2)}</Text>
            </HStack>
            <HStack justifyContent="space-between" mt={2}>
              <Text color="#000" fontWeight="bold" fontSize={18}>Total</Text>
              <Text color="#222" fontWeight="bold" fontSize={18}>${(total - discount).toFixed(2)}</Text>
            </HStack>
          </Box>
          {/* Mostrar método de pago solo si el modo de cobro es 'cashier' */}
          {paymentMode === 'cashier' && (
            <>
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
                      <Button mt={8} variant="outline" borderColor="#111" borderRadius={8} onPress={() => setShowPaymentSheet(false)}>
                        <Text color="#111" fontWeight="bold">Cancelar</Text>
                      </Button>
                    </Box>
                  </SelectContent>
                </SelectPortal>
              </Box>
              {/* Campo para monto recibido y vueltos solo si efectivo */}
              {isEfectivo() && (
                <>
                  <Box mb={2}>
                    <Text color="#222" mb={1} style={{ fontWeight: 'bold' }}>Monto recibido</Text>
                    <TextInput
                      value={receivedAmount}
                      onChangeText={setReceivedAmount}
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
                          : (Number(receivedAmount) === Number(total) ? '0.00' : String(vuelto()))
                      }
                      editable={false}
                      placeholder={
                        Number(receivedAmount) < Number(total) && receivedAmount !== ''
                          ? 'El monto recibido es menor al total'
                          : 'Vueltos'
                      }
                      placeholderTextColor={
                        Number(receivedAmount) < Number(total) && receivedAmount !== ''
                          ? 'red'
                          : '#888'
                      }
                      keyboardType="numeric"
                      style={{ width: '100%', borderRadius: 8, borderWidth: 1, borderColor: '#ccc', marginBottom: 8, color: '#222', backgroundColor: '#f5f5f5', height: 44, minHeight: 44, paddingHorizontal: 12, paddingVertical: 0 }}
                    />
                  </Box>
                </>
              )}
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
                    fetchPaymentMethods();
                  }}
                >
                  <Text color="#f00" fontWeight="bold" fontSize={15} style={{ textAlign: 'center' }}>Reintentar cargar métodos de pago</Text>
                </Button>
              )}
            </>
          )}
          {/* Footer visual para espacio de botones Android */}
          <Box height={48} />
          {/* Espaciador visual para botones Android */}
          {/* Espaciador visual para botones Android */}
          <Box height={48} bg="#fff" />
          {/* Botón de confirmar: lógica según modo de cobro y rol */}
          {(((user?.user?.job_position === 4) && paymentMode === 'cashier') ||
            ((user?.user?.job_position === 1 || user?.user?.job_position === 2) && paymentMode === 'admin')) && (
            <Button
              bg="#111"
              isDisabled={
                paymentMode === 'cashier'
                  ? (!paymentMethod || loading || paymentMethods.length === 0 || (isEfectivo() ? (!receivedAmount || Number(receivedAmount) < (total - discount)) : false))
                  : loading
              }
              onPress={handleConfirm}
              borderRadius={8}
              style={{ paddingVertical: 12, minHeight: 44, width: '100%', elevation: 2, marginBottom: 8 }}
            >
              <Text color="#fff" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>{loading ? 'Procesando...' : 'Confirmar y Cobrar'}</Text>
            </Button>
          )}
          {/* Botón 'Enviar operación' solo para cajero y modo admin, sin más condiciones */}
          {user?.user?.job_position === 4 && paymentMode === 'admin' && (
            <Button
              bg="#f7b731"
              borderRadius={8}
              style={{ paddingVertical: 12, minHeight: 44, width: '100%', elevation: 2, marginBottom: 8 }}
              isDisabled={loading}
              onPressIn={() => {
                if (loading) return;
                if (window.__enviarOperacionInterval) clearInterval(window.__enviarOperacionInterval);
                let count = 3;
                setPressCountEnviar(count);
                setIsPressingEnviar(true);
                window.__enviarOperacionInterval = setInterval(() => {
                  count--;
                  setPressCountEnviar(count);
                  if (count === 0) {
                    clearInterval(window.__enviarOperacionInterval);
                    setIsPressingEnviar(false);
                    setLoading(true);
                    handleConfirm();
                  }
                }, 1000);
              }}
              onPressOut={() => {
                setIsPressingEnviar(false);
                setPressCountEnviar(3);
                if (window.__enviarOperacionInterval) clearInterval(window.__enviarOperacionInterval);
              }}
            >
              <Text color="#222" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>
                {loading ? 'Enviando...' : isPressingEnviar ? `Soltar en ${pressCountEnviar}s` : 'Enviar operación'}
              </Text>
            </Button>
          )}
          <Button
            variant="outline"
            borderColor="#111"
            borderRadius={8}
            style={{ paddingVertical: 12, minHeight: 44, width: '100%', borderWidth: 1, marginBottom: 48}}
            onPress={() => navigation.goBack()}
          >
            <Text color="#111" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>Cancelar</Text>
          </Button>
        </ScrollView>
      {/* Footer fijo visual para espacio de botones Android */}
        <Box position="absolute" left={0} right={0} bottom={0} height={48} bg="#fff" pointerEvents="none"></Box>
    
    </Box>
  );
}