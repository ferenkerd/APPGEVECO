import React, { useState, useContext, useEffect } from 'react';
import {
  Box, VStack, HStack, Text, Button, FlatList, Pressable,
  Select, SelectItem, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator
} from '@gluestack-ui/themed';
import { Modal, View } from 'react-native';
import { FormInput } from '../components/FormInput';
import Toast from 'react-native-toast-message';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { searchClientByCedula, registerClient, getPrefixes } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function StartSaleScreen({ navigation }) {
  const MOCK_PRODUCTS = [
    { id: '1', name: 'Producto A', price: 10, weight: '1kg' },
    { id: '2', name: 'Producto B', price: 20, weight: '500g' },
    { id: '3', name: 'Producto C', price: 15, weight: '2kg' },
  ];

  const MOCK_CLIENTS = [
    { id: '12345678', name: 'Juan Pérez', phone: '04141234567' },
    { id: '87654321', name: 'Ana Gómez', phone: '04147654321' },
  ];

  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();

  // Etapa: 0 = Cliente, 1 = Productos, 2 = Pago
  const [step, setStep] = useState(0);

  // Cliente
  const [clientId, setClientId] = useState('');
  const [client, setClient] = useState(null);
  // Eliminados estados y lógica de registro de cliente (ahora es pantalla independiente)

  // Productos
  const [barcode, setBarcode] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [products, setProducts] = useState([]); // [{id, name, price, qty}]
  const [productError, setProductError] = useState('');

  // Pago
  const [paymentType, setPaymentType] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [currency, setCurrency] = useState('VES');

  // Utilidades
  const subtotal = products.reduce((sum, p) => sum + p.price * p.qty, 0);
  const total = subtotal; // Aquí puedes agregar lógica de impuestos o descuentos
  const vuelto = paymentType === 'cash' && cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;

  // Búsqueda real de cliente por cédula
  const handleSearchClient = async () => {
    setClientError('');
    setClient(null);
    setShowNewClient(false);
    setPendingRegister(false);
    setRegisterModal(false);
    if (!clientId) {
      setClientError('Ingrese la cédula del cliente.');
      return;
    }
    try {
      const accessToken = user?.access;
      const data = await searchClientByCedula(clientId, accessToken);
      if (data && data.id) {
        setClient(data);
        setShowNewClient(false);
        setPendingRegister(false);
        setRegisterModal(false);
        setClientError('');
      } else {
        setClient(null);
        setShowNewClient(false);
        setPendingRegister(true);
        setRegisterModal(false);
        setClientError('Cliente no encontrado.');
        const toastData = {
          type: 'error',
          text1: 'Cliente no encontrado',
          text2: 'Verifica la cédula o registra un nuevo cliente.',
          position: 'top',
          visibilityTime: 3000,
        };
        console.log('[TOAST]', toastData);
        Toast.show(toastData);
      }
    } catch (error) {
      // Intentar parsear el error para distinguir error de negocio
      let errorMsg = '';
      try {
        errorMsg = error.message;
        if (errorMsg === 'Error en la petición a la API' && error.stack) {
          // Buscar el mensaje real en el log de devLog
        }
      } catch {}
      // Si el error es de cliente no encontrado
      if (error && error.message && error.message.includes('No existe un cliente')) {
        setClient(null);
        setShowNewClient(false);
        setPendingRegister(true);
        setRegisterModal(false);
        setClientError('Cliente no encontrado.');
        const toastData = {
          type: 'error',
          text1: 'Cliente no encontrado',
          text2: 'Verifica la cédula o registra un nuevo cliente.',
          position: 'top',
          visibilityTime: 3000,
        };
        console.log('[TOAST]', toastData);
        Toast.show(toastData);
      } else {
        setClient(null);
        setShowNewClient(false);
        setPendingRegister(true);
        setRegisterModal(false);
        setClientError('Error al buscar el cliente.');
        const toastData = {
          type: 'error',
          text1: 'Error de red',
          text2: 'No se pudo buscar el cliente. Intenta de nuevo.',
          position: 'top',
          visibilityTime: 3000,
        };
        console.log('[TOAST]', toastData);
        Toast.show(toastData);
      }
    }
  };

  // Simulación de registro de cliente
  const handleRegisterClient = () => {
    if (!newClient.name || !newClient.id || !newClient.phone) {
      setClientError('Complete todos los campos.');
      return;
    }
    setClient({ ...newClient });
    setShowNewClient(false);
    setClientError('');
  };

  // Simulación de escaneo/agregado de producto
  const handleAddProduct = (product) => {
    const existing = products.find(p => p.id === product.id);
    if (existing) {
      setProducts(products.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
    } else {
      setProducts([...products, { ...product, qty: 1 }]);
    }
    setProductError('');
  };

  // Simulación de búsqueda manual
  const handleManualSearch = () => {
    const found = MOCK_PRODUCTS.find(p =>
      p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.price.toString() === productQuery ||
      p.weight === productQuery
    );
    if (found) {
      handleAddProduct(found);
    } else {
      setProductError('Producto no encontrado.');
    }
  };

  // UI de cada etapa
  const renderStep = () => {
    if (step === 0) {
      // Identificar Cliente
      return (
        <VStack flex={1} justifyContent="center" space="lg">
          <Text fontSize={20} fontWeight="bold" color={palette.text} mb={2} textAlign="center">
            Identificar Cliente
          </Text>
          <Box bg={palette.card} borderRadius={12} p={4} shadow={1}>
            <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>
              Cédula del cliente
            </Text>
            <HStack alignItems="center" space="md">
              <FormInput
                placeholder="Ej: 12345678"
                value={clientId}
                onChangeText={setClientId}
                keyboardType="numeric"
                backgroundColor={palette.input}
                textColor={palette.text}
                style={{ flex: 1 }}
              />
              <Button onPress={handleSearchClient} ml={2} bg={palette.primary} borderRadius={8} px={4}>
                <Text color="#fff">Buscar</Text>
              </Button>
            </HStack>
            {client && (
              <Box bg={palette.surface} p={3} borderRadius={8} mt={4}>
                <Text color={palette.text} fontWeight="bold" fontSize={16} mb={1}>Cliente encontrado</Text>
                <Text color={palette.text}>Nombre: {client.name}</Text>
                <Text color={palette.text}>Cédula: {client.id}</Text>
                <Text color={palette.text}>Teléfono: {client.phone}</Text>
              </Box>
            )}
            {/* Eliminado manejo de errores de registro de cliente aquí */}
            <Button
              mt={6}
              size="xl"
              borderRadius={10}
              onPress={() => setStep(1)}
              isDisabled={!client}
              bg={client ? palette.primary : palette.border}
              alignSelf="center"
              width="100%"
            >
              <Text color={client ? '#fff' : palette.textSecondary} fontWeight="bold" fontSize={18}>Continuar</Text>
            </Button>
            <Button
              mt={2}
              variant="outline"
              borderColor={palette.primary}
              onPress={() => navigation.navigate('RegisterClient')}
              width="100%"
            >
              <Text color={palette.primary}>Registrar nuevo cliente</Text>
            </Button>
          </Box>
        </VStack>
      );
    }
    if (step === 1) {
      // Agregar Productos
      return (
        <VStack flex={1} px={4}>
          <Text fontSize={18} fontWeight="bold" color={palette.text} mb={2}>Agregar Productos</Text>
          <Box bg={palette.card} p={3} borderRadius={8} mb={3}>
            <HStack alignItems="center" mb={2}>
              <Feather name="camera" size={20} color={palette.text} />
              <Text ml={2} color={palette.text}>Simular escaneo de código de barras</Text>
            </HStack>
            <HStack space="md" alignItems="center">
              <FormInput
                flex={1}
                placeholder="Buscar producto manualmente"
                value={productQuery}
                onChangeText={setProductQuery}
                backgroundColor={palette.input}
                textColor={palette.text}
                style={{ flex: 1 }}
              />
              <Button onPress={handleManualSearch} ml={2} bg={palette.primary}>
                <Text color="#fff">Buscar</Text>
              </Button>
            </HStack>
            {productError ? <Text color={palette.error} mt={1}>{productError}</Text> : null}
          </Box>
          <FlatList
            data={products}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <HStack justifyContent="space-between" alignItems="center" bg={palette.input} p={2} borderRadius={6} mb={2}>
                <Text color={palette.text}>{item.name}</Text>
                <Text color={palette.text}>x{item.qty}</Text>
                <Text color={palette.text}>${item.price * item.qty}</Text>
              </HStack>
            )}
            ListEmptyComponent={<Text color={palette.text} textAlign="center" mt={4}>No hay productos agregados.</Text>}
            style={{ flex: 1, minHeight: 120 }}
          />
          <Box bg={palette.card} p={3} borderRadius={8} mt={2} mb={2}>
            <HStack justifyContent="space-between">
              <Text color={palette.text}>Subtotal:</Text>
              <Text color={palette.text}>${subtotal.toFixed(2)}</Text>
            </HStack>
            <HStack justifyContent="space-between" mt={1}>
              <Text color={palette.text} fontWeight="bold">Total:</Text>
              <Text color={palette.text} fontWeight="bold">${total.toFixed(2)}</Text>
            </HStack>
          </Box>
          <Button
            mt={2}
            onPress={() => setStep(2)}
            isDisabled={products.length === 0}
            bg={palette.primary}
          >
            <Text color="#fff">Procesar Pago</Text>
          </Button>
        </VStack>
      );
    }
    if (step === 2) {
      // Procesar Pago
      return (
        <VStack flex={1} px={4}>
          <Text fontSize={18} fontWeight="bold" color={palette.text} mb={2}>Procesar Pago</Text>
          <Text color={palette.text} mb={2}>Total a pagar: ${total.toFixed(2)}</Text>
          <VStack space="md" mb={3}>
            <Text color={palette.text} mb={1}>Seleccione método de pago:</Text>
            <HStack space="md">
              <Button
                variant={paymentType === 'cash' ? 'solid' : 'outline'}
                onPress={() => setPaymentType('cash')}
                bg={paymentType === 'cash' ? palette.primary : palette.input}
              >
                <Text color={paymentType === 'cash' ? '#fff' : palette.text}>Efectivo</Text>
              </Button>
              <Button
                variant={paymentType === 'transfer' ? 'solid' : 'outline'}
                onPress={() => setPaymentType('transfer')}
                bg={paymentType === 'transfer' ? palette.primary : palette.input}
              >
                <Text color={paymentType === 'transfer' ? '#fff' : palette.text}>Transferencia</Text>
              </Button>
              <Button
                variant={paymentType === 'other' ? 'solid' : 'outline'}
                onPress={() => setPaymentType('other')}
                bg={paymentType === 'other' ? palette.primary : palette.input}
              >
                <Text color={paymentType === 'other' ? '#fff' : palette.text}>Otro</Text>
              </Button>
            </HStack>
            {paymentType === 'cash' && (
              <VStack space="sm" mt={2}>
                <FormInput
                  placeholder="Monto recibido"
                  value={cashReceived}
                  onChangeText={setCashReceived}
                  keyboardType="numeric"
                  backgroundColor={palette.input}
                  textColor={palette.text}
                />
                <Text color={palette.text} mt={1}>Vuelto: ${vuelto.toFixed(2)}</Text>
              </VStack>
            )}
            {paymentType === 'transfer' && (
              <VStack space="sm" mt={2}>
                <FormInput
                  placeholder="Referencia de transferencia"
                  value={transferRef}
                  onChangeText={setTransferRef}
                  backgroundColor={palette.input}
                  textColor={palette.text}
                />
              </VStack>
            )}
            {/* Conversión de divisas */}
            <VStack mt={2}>
              <Text color={palette.text} mb={1}>Ver total en otra moneda:</Text>
              <Select
                selectedValue={currency}
                onValueChange={setCurrency}
                bg={palette.input}
                color={palette.text}
              >
                <SelectItem label="Bolívares (VES)" value="VES" />
                <SelectItem label="Dólares (USD)" value="USD" />
                <SelectItem label="Pesos (COP)" value="COP" />
              </Select>
              <Text color={palette.text} mt={1}>
                Total: {currency === 'VES' ? `Bs. ${(total * 36).toFixed(2)}` : currency === 'USD' ? `$${total.toFixed(2)}` : `COL$ ${(total * 4000).toFixed(2)}`}
              </Text>
            </VStack>
          </VStack>
          <Button mt={4} onPress={() => alert('Venta finalizada')} bg={palette.primary}>
            <Text color="#fff">Finalizar Venta</Text>
          </Button>
        </VStack>
      );
    }
    return null;
  };

  return (
    <Box flex={1} bg={palette.surface} paddingHorizontal={16}>
      {renderStep()}
    </Box>
  );
}
