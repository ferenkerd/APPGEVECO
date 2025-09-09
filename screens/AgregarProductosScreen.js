import React, { useState, useContext, useCallback, useRef } from 'react';
import { Box, VStack, HStack, Text, Button, FlatList } from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import BarcodeScannerButton from '../components/BarcodeScannerButton';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import CategoryList from '../components/CategoryList';
import { Modal, Animated, Dimensions, TouchableWithoutFeedback, PanResponder } from 'react-native';

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
  const [showScanner, setShowScanner] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const windowHeight = Dimensions.get('window').height;
  const sheetHeight = 400; // Altura media
  const topMargin = 24; // Margen superior
  const minTop = topMargin; // Top para expandido (pantalla completa menos margen)
  const fullHeight = windowHeight - topMargin;
  const midTop = windowHeight - sheetHeight; // Top para medio
  const slideAnim = useRef(new Animated.Value(windowHeight)).current;

  // PanResponder para arrastrar el sheet
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Limitar el movimiento entre expandido y cerrado
        let newTop = midTop + gestureState.dy;
        if (newTop < minTop) newTop = minTop;
        if (newTop > windowHeight) newTop = windowHeight;
        slideAnim.setValue(newTop);
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentTop = slideAnim._value;
        if (gestureState.dy > 100) {
          // Cerrar si arrastra hacia abajo suficiente
          Animated.timing(slideAnim, {
            toValue: windowHeight,
            duration: 200,
            useNativeDriver: false,
          }).start(() => setSheetOpen(false));
        } else if (gestureState.dy < -100 || currentTop < (midTop + minTop) / 2) {
          // Expandir si arrastra hacia arriba suficiente
          Animated.spring(slideAnim, {
            toValue: minTop,
            useNativeDriver: false,
          }).start();
        } else {
          // Volver a posición media
          Animated.spring(slideAnim, {
            toValue: midTop,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // Simulación de búsqueda manual (puedes conectar a tu API real)
  const MOCK_PRODUCTS = [
    { id: '1', name: 'Producto A', price: 10, weight: '1kg' },
    { id: '2', name: 'Producto B', price: 20, weight: '500g' },
    { id: '3', name: 'Producto C', price: 15, weight: '2kg' },
  ];

  // Nuevo: Estado para productos filtrados
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);

  // Filtrar productos en tiempo real
  React.useEffect(() => {
    if (!productQuery) {
      setFilteredProducts(MOCK_PRODUCTS);
    } else {
      setFilteredProducts(
        MOCK_PRODUCTS.filter(p =>
          p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
          p.id === productQuery ||
          p.price.toString() === productQuery ||
          p.weight === productQuery
        )
      );
    }
  }, [productQuery]);

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

  const handleScanBarcode = useCallback(() => {
    navigation.navigate('CameraBarcode', {
      onScanned: (data) => setProductQuery(data),
    });
  }, [navigation]);

  // Nuevo: Agregar producto automáticamente al escanear
  const handleBarCodeScanned = (data) => {
    setProductQuery(data);
    setShowScanner(false);
    // Buscar producto por código escaneado y agregarlo automáticamente
    const found = MOCK_PRODUCTS.find(p => p.id === data);
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
        {/* Botón para abrir el Sheet */}
        <Button mb={2} onPress={() => setSheetOpen(true)} bg={palette.primary} width="100%">
          <Text color="#fff">Buscar y agregar productos</Text>
        </Button>
        {/* Modal Bottom Sheet 100% compatible Expo */}
        <Modal
          visible={sheetOpen}
          animationType="fade"
          transparent
          onShow={() => {
            Animated.timing(slideAnim, {
              toValue: midTop,
              duration: 250,
              useNativeDriver: false,
            }).start();
            setIsExpanded(false);
          }}
          onRequestClose={() => setSheetOpen(false)}
        >
          <TouchableWithoutFeedback onPress={() => setSheetOpen(false)}>
            <Animated.View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
          </TouchableWithoutFeedback>
          <Animated.View
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: slideAnim,
              backgroundColor: palette.surface,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 16,
              minHeight: sheetHeight,
              maxHeight: fullHeight,
              height: fullHeight,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* Header del sheet: expandir/colapsar a la izquierda, cerrar a la derecha */}
            <HStack width="100%" alignItems="center" justifyContent="space-between" mb={2}>
              <Button
                size="sm"
                variant="outline"
                onPress={() => {
                  if (isExpanded) {
                    Animated.spring(slideAnim, {
                      toValue: midTop,
                      useNativeDriver: false,
                    }).start();
                    setIsExpanded(false);
                  } else {
                    Animated.spring(slideAnim, {
                      toValue: minTop,
                      useNativeDriver: false,
                    }).start();
                    setIsExpanded(true);
                  }
                }}
                style={{ height: 32, minWidth: 32, paddingHorizontal: 8 }}
              >
                <Text fontSize={20}>{isExpanded ? '↓' : '↑'}</Text>
              </Button>
              <Text fontSize={20} fontWeight="bold">Buscar y agregar productos</Text>
              <Button
                size="sm"
                variant="outline"
                onPress={() => {
                  Animated.timing(slideAnim, {
                    toValue: windowHeight,
                    duration: 200,
                    useNativeDriver: false,
                  }).start(() => setSheetOpen(false));
                }}
                style={{ height: 32, minWidth: 32, paddingHorizontal: 8 }}
              >
                <Text fontSize={20}>×</Text>
              </Button>
            </HStack>
            <Text fontSize={20} fontWeight="bold" mb={2}>Buscar y agregar productos</Text>
            <VStack space="md">
              <HStack width="100%" alignItems="center" mb={2}>
                <FormInput
                  placeholder="Buscar producto"
                  value={productQuery}
                  onChangeText={setProductQuery}
                  backgroundColor={palette.input}
                  textColor={palette.text}
                  style={{ flex: 1 }}
                />
                <BarcodeScannerButton onPress={() => setShowScanner(true)} />
              </HStack>
              <CategoryList
                categories={categories}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <BarcodeScannerModal
                visible={showScanner}
                onScanned={handleBarCodeScanned}
                onClose={() => setShowScanner(false)}
              />
              <Text fontSize={18} fontWeight="bold" color={palette.text} mt={2} mb={1}>Productos disponibles</Text>
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <HStack justifyContent="space-between" alignItems="center" bg={palette.input} p={2} borderRadius={6} mb={2}>
                    <Text color={palette.text}>{item.name}</Text>
                    <Text color={palette.text}>${item.price}</Text>
                    <Button
                      size="sm"
                      bg={palette.primary}
                      onPress={() => {
                        const existing = products.find(p => p.id === item.id);
                        if (existing) {
                          setProducts(products.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
                        } else {
                          setProducts([...products, { ...item, qty: 1 }]);
                        }
                      }}
                    >
                      <Text color="#fff">Agregar</Text>
                    </Button>
                  </HStack>
                )}
                ListEmptyComponent={<Text color={palette.text} textAlign="center" mt={4}>No hay productos disponibles.</Text>}
                style={{ flex: 1, minHeight: 120, width: '100%' }}
              />
            </VStack>
          </Animated.View>
        </Modal>
        {/* Lista de productos seleccionados para la venta */}
        <Text fontSize={18} fontWeight="bold" color={palette.text} mt={4} mb={1}>Productos seleccionados</Text>
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
