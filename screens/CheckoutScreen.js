import React from 'react';
import { Box, VStack, HStack, Button, Input, Text, Divider } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';
import { createSale, registerPayment, getPaymentMode } from '../services/api';

// Recibe los datos de productos, cliente y total por params
export default function CheckoutScreen() {
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
    try {
      const res = await fetch('https://zp5qjj4n-8000.use2.devtunnels.ms/payment-methods/', {
        headers: { Authorization: `Bearer ${user?.access}` },
      });
      const data = await res.json();
      setPaymentMethods(data);
      if (!Array.isArray(data) || data.length === 0) {
        setPaymentMethodsError(true);
        Toast.show({
          type: 'info',
          text1: 'Métodos de pago',
          text2: 'No hay métodos de pago disponibles. Contacta al administrador.'
        });
      }
    } catch {
      setPaymentMethodsError(true);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'No se pudieron cargar los métodos de pago.'
      });
    }
  };

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
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <Text fontSize={22} fontWeight="bold" mb={12}>Resumen de Operación</Text>
          <Box bg="#f7f7f7" borderRadius={12} p={14} mb={16}>
            <Text fontWeight="bold" mb={4}>Cliente:</Text>
            {selectedClient ? (
              <VStack mb={8} space="xs">
                <Text><Text fontWeight="bold">Nombre:</Text> {selectedClient.first_name || selectedClient.nombre || ''} {selectedClient.last_name || ''}</Text>
                {selectedClient.identity_card && (
                  <Text><Text fontWeight="bold">Cédula:</Text> {selectedClient.identity_card}</Text>
                )}
                {selectedClient.contact_phone && (
                  <Text>
                    <Text fontWeight="bold">Teléfono:</Text> {selectedClient.prefix && selectedClient.prefix.code ? `+${selectedClient.prefix.code} ` : ''}{selectedClient.contact_phone}
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
            <Text fontWeight="bold" mb={4}>Productos:</Text>
            <VStack space="sm">
              {selectedProducts.map((prod, idx) => {
                const qty = prod.qty || prod.quantity || 1;
                const price = Number(prod.sale_price || prod.price || 0);
                return (
                  <HStack key={idx} justifyContent="space-between" alignItems="center">
                    <Text>{prod.name} x{qty}</Text>
                    <Text>${(price * qty).toFixed(2)}</Text>
                  </HStack>
                );
              })}
            </VStack>
            <Divider my={8} />
            <HStack justifyContent="space-between" mb={2}>
              <Text>Subtotal:</Text>
              <Text>${total}</Text>
            </HStack>
            {discount > 0 && (
              <HStack justifyContent="space-between" mb={2}>
                <Text>Descuento:</Text>
                <Text color="#43a047">-${discount}</Text>
              </HStack>
            )}
            <HStack justifyContent="space-between" mb={2}>
              <Text fontWeight="bold">Total:</Text>
              <Text fontWeight="bold">${total - discount}</Text>
            </HStack>
          </Box>
          <Text fontWeight="bold" mb={8}>Método de pago</Text>
          <Box mb={16} borderWidth={1} borderColor="#ccc" borderRadius={8} overflow="hidden">
            <Picker
              selectedValue={paymentMethod}
              onValueChange={(itemValue) => setPaymentMethod(itemValue)}
            >
              <Picker.Item label="Selecciona método de pago" value="" />
              {(Array.isArray(paymentMethods) ? paymentMethods : []).map((pm) => (
                <Picker.Item key={pm.id} label={pm.name} value={pm.id} />
              ))}
            </Picker>
          </Box>
          {paymentMethodsError && (
            <Button
              variant="outline"
              borderColor="#f00"
              mt={-8}
              mb={12}
              borderRadius={8}
              style={{ paddingVertical: 10, minHeight: 40, width: '100%', borderWidth: 1 }}
              onPress={fetchPaymentMethods}
            >
              <Text color="#f00" fontWeight="bold" fontSize={15} style={{ textAlign: 'center' }}>Reintentar cargar métodos de pago</Text>
            </Button>
          )}
          {/* Botón de cobro solo visible según modo y rol corregido */}
          {(((user?.user?.job_position === 4) && paymentMode === 'cashier') ||
            ((user?.user?.job_position === 1 || user?.user?.job_position === 2) && paymentMode === 'admin')) && (
            <Button
              bg="#111"
              isDisabled={!paymentMethod || loading}
              onPress={handleConfirm}
              borderRadius={8}
              style={{ paddingVertical: 12, minHeight: 44, marginTop: 12, width: '100%', elevation: 2 }}
            >
              <Text color="#fff" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>{loading ? 'Procesando...' : 'Confirmar y Cobrar'}</Text>
            </Button>
          )}
          {/* Solo admin y modo admin pueden crear orden pendiente */}
          {user?.user?.job_position === 2 && paymentMode === 'admin' && (
            <Button
              bg="#f7b731"
              isDisabled={loading}
              onPress={handlePendingOrder}
              borderRadius={8}
              style={{ paddingVertical: 12, minHeight: 44, marginTop: 12, width: '100%', elevation: 2 }}
            >
              <Text color="#222" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>Crear Orden Pendiente</Text>
            </Button>
          )}
          <Button
            variant="outline"
            borderColor="#111"
            mt={16}
            borderRadius={8}
            style={{ paddingVertical: 12, minHeight: 44, width: '100%', borderWidth: 1, marginTop: 12 }}
            onPress={() => navigation.goBack()}
          >
            <Text color="#111" fontWeight="bold" fontSize={15} style={{ letterSpacing: 0.2, textAlign: 'center' }}>Cancelar</Text>
          </Button>
        </ScrollView>
      </Box>
    );
}
