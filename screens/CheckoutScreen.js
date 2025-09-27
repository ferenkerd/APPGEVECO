import React from 'react';
import { Box, VStack, HStack, Button, Input, Text, Divider, Popover } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { createSale, registerPayment, getPaymentMode, getPaymentMethods } from '../services/api';

// Recibe los datos de productos, cliente y total por params
export default function CheckoutScreen() {
  // Estado para controlar el popover abierto
  const [openPopoverIdx, setOpenPopoverIdx] = React.useState(null);
  // Métodos de pago dinámicos
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedProducts = [], selectedClient = null, total = 0, discount = 0 } = route.params || {};
  const [paymentMethod, setPaymentMethod] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState('');
  const { user } = useAuth();

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

  // Lógica de crear venta y pago (directa)
  const handleConfirm = async () => {
    setLoading(true);
    try {
      // 1. Crear venta
      const saleBody = {
        client_id: selectedClient.id,
        total_amount: total,
        status: 'paid',
        details_input: selectedProducts.map(prod => ({
          product: prod.id,
          product_quantity: prod.qty || prod.quantity || 1,
          sale_price_at_time_of_sale: Number(prod.sale_price || prod.price || 0),
          applied_discount: 0
        }))
      };
      console.log('Body que se enviará a /sales/:', saleBody);
      const sale = await createSale(saleBody, user?.access);
      await registerPayment({
        sale: sale.id,
        payment_method: paymentMethod, // Ahora es el ID real
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
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'No se pudo registrar la operación.' });
    }
    setLoading(false);
  };

  // Lógica de crear orden pendiente (solo admin y modo admin)
  const handlePendingOrder = async () => {
    setLoading(true);
    try {
      const saleBody = {
        client_id: selectedClient.id,
        total_amount: total,
        status: 'pending',
        details_input: selectedProducts.map(prod => ({
          product: prod.id,
          product_quantity: prod.qty || prod.quantity || 1,
          sale_price_at_time_of_sale: Number(prod.sale_price || prod.price || 0),
          applied_discount: 0
        }))
      };
      console.log('Body que se enviará a /sales/ (pendiente):', saleBody);
      const sale = await createSale(saleBody, user?.access);
      Toast.show({ type: 'success', text1: 'Orden pendiente creada', text2: 'La orden fue registrada correctamente.' });
      clearCart();
      navigation.replace('ResumenVenta', {
        venta: sale,
        client: selectedClient,
        products: selectedProducts,
        total,
        paymentType: 'pendiente',
        currency: 'USD',
      });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'No se pudo registrar la orden.' });
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
                    {/* Columna: Nombre del producto (con popover) */}
                    <Box flex={2} maxWidth={180}>
                      <Popover
                        isOpen={openPopoverIdx === idx}
                        onOpen={() => setOpenPopoverIdx(idx)}
                        onClose={() => setOpenPopoverIdx(null)}
                        closeOnBlur={true}
                        closeOnEsc={true}
                        trigger={triggerProps => (
                          <Text
                            {...triggerProps}
                            style={{ maxWidth: 180 }}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {prod.name}
                          </Text>
                        )}
                      >
                        <Popover.Content
                          style={{
                            backgroundColor: '#fff',
                            borderWidth: 1,
                            borderColor: '#111',
                            maxWidth: 260,
                          }}
                        >
                          <Popover.Arrow style={{ backgroundColor: '#fff' }} />
                          <Popover.Body style={{ flexShrink: 1 }}>
                            <ScrollView
                              nestedScrollEnabled={true}
                              contentContainerStyle={{ flexGrow: 1}}
                              style={{ minHeight: 32, maxHeight: 140, maxWidth: 240 }}
                            >
                              <Text
                                style={{ fontSize: 16, textAlign: 'center', flexWrap: 'wrap' }}
                                onPress={() => setOpenPopoverIdx(null)}
                              >
                                {prod.name}
                              </Text>
                            </ScrollView>
                          </Popover.Body>
                        </Popover.Content>
                      </Popover>
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
          <Text fontWeight="bold" mb={8}>Método de pago</Text>
          <Box mb={16} borderWidth={1} borderColor="#ccc" borderRadius={8} overflow="hidden">
            {paymentMethods.length === 0 && !paymentMethodsError ? (
              <Text color="#f00" fontWeight="bold" p={12} textAlign="center">
                No hay métodos de pago disponibles. Contacte al administrador.
              </Text>
            ) : (
              <Picker
                selectedValue={paymentMethod}
                onValueChange={(itemValue) => setPaymentMethod(itemValue)}
                enabled={paymentMethods.length > 0}
              >
                <Picker.Item label="Selecciona método de pago" value="" />
                {(Array.isArray(paymentMethods) ? paymentMethods : []).map((pm) => (
                  <Picker.Item key={pm.id} label={pm.name} value={pm.id} />
                ))}
              </Picker>
            )}
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
                fetchPaymentMethods();
              }}
            >
              <Text color="#f00" fontWeight="bold" fontSize={15} style={{ textAlign: 'center' }}>Reintentar cargar métodos de pago</Text>
            </Button>
          )}
          {/* Footer visual para espacio de botones Android */}
          <Box height={48} />
          {/* Espaciador visual para botones Android */}
          {/* Espaciador visual para botones Android */}
          <Box height={48} bg="#fff" />
          {(((user?.user?.job_position === 4) && paymentMode === 'cashier') ||
            ((user?.user?.job_position === 1 || user?.user?.job_position === 2) && paymentMode === 'admin')) && (
            <Button
              bg="#111"
              isDisabled={!paymentMethod || loading || paymentMethods.length === 0}
              onPress={handleConfirm}
              borderRadius={8}
              style={{ paddingVertical: 12, minHeight: 44, width: '100%', elevation: 2, marginBottom: 8 }}
            >
              <Text color="#fff" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>{loading ? 'Procesando...' : 'Confirmar y Cobrar'}</Text>
            </Button>
          )}
          {user?.user?.job_position === 4 && paymentMode === 'admin' && (
            <Button
              bg="#f7b731"
              isDisabled={loading || paymentMethods.length === 0}
              onPress={handlePendingOrder}
              borderRadius={8}
              style={{ paddingVertical: 12, minHeight: 44, width: '100%', elevation: 2, marginBottom: 8 }}
            >
              <Text color="#222" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>{loading ? 'Enviando...' : 'Enviar operación'}</Text>
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