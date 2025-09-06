import React, { useState, useContext } from 'react';
import { Box, VStack, HStack, Text, Button, FlatList } from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
// import BarcodeScannerButton from '../components/BarcodeScannerButton';
// import BarcodeScannerModal from '../components/BarcodeScannerModal';
import CategoryList from '../components/CategoryList';
  // const [scannerVisible, setScannerVisible] = useState(false);

export default function AgregarProductosScreen({ navigation, route }) {
  const { client } = route.params;
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [productQuery, setProductQuery] = useState('');
  const [products, setProducts] = useState([]); // [{id, name, price, qty}]
  const [productError, setProductError] = useState('');
  const [categories] = useState([
    { id: 'all', name: 'Todos' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'limpieza', name: 'Limpieza' },
  ]);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);

  // Simulación de búsqueda manual (puedes conectar a tu API real)
  const MOCK_PRODUCTS = [
    { id: '1', name: 'Producto A', price: 10, weight: '1kg' },
    { id: '2', name: 'Producto B', price: 20, weight: '500g' },
    { id: '3', name: 'Producto C', price: 15, weight: '2kg' },
  ];

  const handleManualSearch = () => {
    const found = MOCK_PRODUCTS.find(p =>
      p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.price.toString() === productQuery ||
      p.weight === productQuery
    );
    if (found) {
      const existing = products.find(p => p.id === found.id);
      if (existing) {
        setProducts(products.map(p => p.id === found.id ? { ...p, qty: p.qty + 1 } : p));
      } else {
        setProducts([...products, { ...found, qty: 1 }]);
      }
      setProductError('');
    } else {
      setProductError('Producto no encontrado.');
    }
  };

  const subtotal = products.reduce((sum, p) => sum + p.price * p.qty, 0);

  return (
    <Box flex={1} bg={palette.surface} padding={16}>
      <VStack space="md" alignItems="flex-start" width="100%">
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="left">
          Agregar Productos
        </Text>
        {/* Categorías */}
        <CategoryList
          categories={categories}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />
        {/* Barra de búsqueda y escáner */}
        <HStack width="100%" alignItems="center" mb={2}>
          <FormInput
            placeholder="Buscar producto"
            value={productQuery}
            onChangeText={setProductQuery}
            backgroundColor={palette.input}
            textColor={palette.text}
            style={{ flex: 1 }}
          />
          {/* <BarcodeScannerButton onPress={() => setScannerVisible(true)} /> */}
      {/* <BarcodeScannerModal
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={data => {
          setProductQuery(data);
          setScannerVisible(false);
        }}
      /> */}
        </HStack>
        <Button onPress={handleManualSearch} bg={palette.primary} width="100%">
          <Text color="#fff">Buscar</Text>
        </Button>
        {productError ? <Text color={palette.error} mt={1}>{productError}</Text> : null}
        {/* Lista de productos agregados */}
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
          style={{ flex: 1, minHeight: 120, width: '100%' }}
        />
        <Box bg={palette.card} p={3} borderRadius={8} mt={2} mb={2} width="100%">
          <HStack justifyContent="space-between">
            <Text color={palette.text}>Subtotal:</Text>
            <Text color={palette.text}>${subtotal.toFixed(2)}</Text>
          </HStack>
        </Box>
        <Button mt={2} onPress={() => navigation.navigate('ProcesarPago', { client, products })} bg={palette.primary} width="100%" isDisabled={products.length === 0}>
          <Text color="#fff">Procesar Pago</Text>
        </Button>
      </VStack>
    </Box>
  );
}
