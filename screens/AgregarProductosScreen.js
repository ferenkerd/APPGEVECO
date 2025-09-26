import React, { useState, useContext, useCallback, useRef } from 'react';
import { Box, VStack, HStack, Text, Button, FlatList, Popover } from '@gluestack-ui/themed';
import { TouchableOpacity, View, SafeAreaView, Platform } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FormInput } from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import BarcodeScannerButton from '../components/BarcodeScannerButton';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import CategoryList from '../components/CategoryList';
import { Modal, Animated, Dimensions, TouchableWithoutFeedback, PanResponder } from 'react-native';
import { apiFetch } from '../services/api';

// AgregarProductosScreen debe ser un componente funcional
export default function AgregarProductosScreen({ navigation, route }) {
  const [openPopoverIndex, setOpenPopoverIndex] = useState(null);
  const [isPressingPay, setIsPressingPay] = useState(false);
  const [pressCountPay, setPressCountPay] = useState(3);
  const pressIntervalPay = useRef();
  const [unitPriceModal, setUnitPriceModal] = useState({ visible: false, price: null });
  // Tabs: 'barcode', 'search', 'all'
  const [tab, setTab] = useState('barcode');
  const [sheetType, setSheetType] = useState(null); // 'search' | 'all' | null
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  // CustomTabBar interno, mismo estilo visual que dashboard
  function InternalTabBar() {
    return (
      <SafeAreaView
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: palette.background,
          paddingBottom: Platform.OS === 'ios' ? 16 : 32,
          zIndex: 10,
        }}
        edges={Platform.OS === 'ios' ? ['bottom'] : undefined}
      >
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
          bg={palette.background}
          style={{
            height: 70,
            borderTopWidth: 0,
            paddingHorizontal: 16,
          }}
        >
          {/* Buscar */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setSheetType('search')}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="search" size={28} color={palette.primary} />
            <Text fontSize={12} color={palette.primary} mt={1} style={{ fontWeight: 'bold' }}>Buscar</Text>
          </TouchableOpacity>
          {/* Escanear (botón central grande y elevado) */}
          <View style={{ flex: 1, alignItems: 'center', top: -24 }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={tab === 'barcode' ? { selected: true } : {}}
              onPress={() => {
                setTab('barcode');
                setShowScanner(true);
              }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: palette.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.18,
                shadowRadius: 8,
                elevation: 8,
                borderWidth: 4,
                borderColor: palette.background,
              }}
              activeOpacity={0.85}
            >
              <MaterialIcons name="qr-code-scanner" size={32} color="#fff" />
            </TouchableOpacity>
            <Text fontSize={12} color={palette.primary} mt={2} style={{ fontWeight: tab === 'barcode' ? 'bold' : 'normal' }}>Escanear</Text>
          </View>
          {/* Procesar Pago */}
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => setSheetType('pago')}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            activeOpacity={0.7}
          >
            <MaterialIcons name="more-horiz" size={28} color={palette.primary} />
            <Text fontSize={12} color={palette.primary} mt={1} style={{ fontWeight: 'bold' }}>Otros</Text>
          </TouchableOpacity>
        </Box>
      </SafeAreaView>
    );
  }
  const client = route?.params?.client;
  const { user } = useAuth();

  const [productQuery, setProductQuery] = useState('');
  const [products, setProducts] = useState([]); // [{id, name, price, qty}]
  const [productError, setProductError] = useState('');
  const [categories, setCategories] = useState([]);
  // Obtener categorías del backend al montar
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiFetch('/categories/', { method: 'GET' }, user?.access);
        setCategories(response);
      } catch (e) {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [user]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  // Estado para descuento/cupón
  const [discountCode, setDiscountCode] = useState('');
  const [discountMessage, setDiscountMessage] = useState('');
  const [discountSuccess, setDiscountSuccess] = useState(false);

  // Simulación de validación de cupón
  const handleApplyDiscount = () => {
    if (!discountCode) {
      setDiscountMessage('Ingresa un código.');
      setDiscountSuccess(false);
      return;
    }
    // Aquí puedes validar el cupón con una API o lógica propia
    if (discountCode.toLowerCase() === 'descuento10') {
      setDiscountMessage('¡Cupón aplicado: 10% de descuento!');
      setDiscountSuccess(true);
    } else {
      setDiscountMessage('Cupón inválido o expirado.');
      setDiscountSuccess(false);
    }
  };

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

  // Estado para productos reales
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Obtener productos reales del backend
  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await apiFetch('/products/', { method: 'GET' }, user?.access);
        setAllProducts(response);
        setFilteredProducts(response);
      } catch (e) {
        setAllProducts([]);
        setFilteredProducts([]);
      }
    };
    fetchProducts();
  }, [user]);

  // Filtrar productos en tiempo real
  React.useEffect(() => {
    if (!productQuery) {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(
        allProducts.filter(p => {
          const query = productQuery.toLowerCase();
          const barcode = (p.barcode || p.code || '').toLowerCase();
          const name = (p.name || '').toLowerCase();
          const id = p.id ? p.id.toString() : '';
          const salePrice = p.sale_price ? p.sale_price.toString() : '';
          return (
            barcode.includes(query) ||
            name.includes(query) ||
            id.includes(query) ||
            salePrice.includes(query)
          );
        })
      );
    }
  }, [productQuery, allProducts]);

  // Eliminar handleManualSearch (ya no se usa MOCK_PRODUCTS)

  // Nuevo: Agregar producto automáticamente al escanear (sin colocar el código en el input de búsqueda)
  const handleBarCodeScanned = (data) => {
    setShowScanner(false);
    // Buscar producto por código escaneado y agregarlo automáticamente
    const found = allProducts.find(p => p.id === data);
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

  const subtotal = products.reduce((sum, p) => sum + p.sale_price * p.qty, 0);

  console.log('DEBUG products:', products);

  return (
    <Box flex={1} bg={palette.surface} padding={16}>
      {/* Contenido principal, con padding abajo para la barra y la tarjeta fija */}
      <VStack space="md" alignItems="flex-start" width="100%" style={{ paddingBottom: 200 }}>
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="left">
          Agregar Productos
        </Text>
        {/* Botón para abrir el Sheet */}
        {/* El botón principal ahora será el escáner flotante, se elimina el botón superior */}
      {/* Modal deslizable para Buscar y Todos */}
      <Modal
        visible={!!sheetType}
        animationType="slide"
        transparent
        onRequestClose={() => setSheetType(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSheetType(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} />
        </TouchableWithoutFeedback>
        <View style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: palette.surface,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 16,
          minHeight: 320,
          maxHeight: '80%',
        }}>
          {sheetType === 'search' && (
            <>
              <Text fontSize={18} fontWeight="bold" color={palette.text} mt={2} mb={1}>Buscar por nombre, precio o código</Text>
              <FormInput
                placeholder="Buscar producto"
                value={productQuery}
                onChangeText={setProductQuery}
                backgroundColor={palette.input}
                textColor={palette.text}
                style={{ width: '100%' }}
              />
              <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <HStack justifyContent="space-between" alignItems="center" bg={palette.input} p={2} borderRadius={6} mb={2}>
                    <VStack alignItems="flex-start" flex={1}>
                      <Text color={palette.text} fontWeight="bold">{item.name}</Text>
                      <Text color={palette.text} fontSize={12}>Código: {item.id}</Text>
                      <Text color={palette.text} fontSize={12}>Código de barras: {item.code || 'N/A'}</Text>
                      <Text color={palette.text} fontSize={12}>Precio: ${item.sale_price}</Text>
                    </VStack>
                    <Button
                      size="sm"
                      bg={palette.primary}
                      onPress={async () => {
                        const existing = products.find(p => p.id === item.id);
                        if (existing) {
                          setProducts(products.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
                        } else {
                          setProducts([...products, { ...item, qty: 1 }]);
                        }
                        try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
                        try {
                          const { sound } = await Audio.Sound.createAsync(
                            require('../assets/beep.mp3'),
                            { shouldPlay: true }
                          );
                          // Liberar el recurso después de reproducir
                          sound.setOnPlaybackStatusUpdate(status => {
                            if (status.didJustFinish) sound.unloadAsync();
                          });
                        } catch {}
                        Toast.show({
                          type: 'success',
                          text1: 'Producto agregado',
                          text2: item.name,
                        });
                      }}
                    >
                      <Text color="#fff">Agregar</Text>
                    </Button>
                  </HStack>
                )}
                ListEmptyComponent={<Text color={palette.text} textAlign="center" mt={4}>No hay productos disponibles.</Text>}
                style={{ flex: 1, minHeight: 120, width: '100%' }}
              />
            </>
          )}
          {sheetType === 'pago' && (
            <Box>
              {client && (
                <Box bg={palette.card} borderRadius={14} p={18} alignItems="flex-start" shadow={2} mt={2} mb={2}>
                  <HStack alignItems="center" mb={3}>
                    <MaterialIcons name="person" size={32} color={palette.primary} style={{ marginRight: 10 }} />
                    <Text fontSize={20} fontWeight="bold" color={palette.primary}>Información del cliente</Text>
                  </HStack>
                  <Text color={palette.text} fontSize={17} mb={1}><Text fontWeight="bold">Nombre:</Text> {client.first_name || client.nombre || 'N/A'}</Text>
                  <Text color={palette.text} fontSize={17} mb={1}><Text fontWeight="bold">ID:</Text> {client.id || 'N/A'}</Text>
                  {client.email && (
                    <Text color={palette.text} fontSize={17} mb={1}><Text fontWeight="bold">Email:</Text> {client.email}</Text>
                  )}
                  {client.phone && (
                    <Text color={palette.text} fontSize={17} mb={1}><Text fontWeight="bold">Teléfono:</Text> {client.phone}</Text>
                  )}
                </Box>
              )}
              {/* Card visual para aplicar descuento/cupón */}
              <Box bg={palette.card} borderRadius={14} p={18} alignItems="flex-start" shadow={2} mt={2} mb={2} width="100%">
                <HStack alignItems="center" mb={3}>
                  <MaterialIcons name="local-offer" size={28} color={palette.primary} style={{ marginRight: 10 }} />
                  <Text fontSize={18} fontWeight="bold" color={palette.primary}>Aplicar descuento/cupón</Text>
                </HStack>
                <Box flexDirection="row" alignItems="center" width="100%">
                  <FormInput
                    placeholder="Código de descuento"
                    value={discountCode}
                    onChangeText={setDiscountCode}
                    backgroundColor={palette.surface}
                    textColor={palette.text}
                    style={{ flex: 1, marginRight: 8 }}
                  />
                  <Button size="sm" bg={palette.primary} onPress={handleApplyDiscount}>
                    <Text color="#fff">Aplicar</Text>
                  </Button>
                </Box>
                {discountMessage ? (
                  <Text color={discountSuccess ? '#43a047' : '#e53935'} mt={2}>{discountMessage}</Text>
                ) : null}
              </Box>
            </Box>
          )}
        </View>
      </Modal>
       
  <Box style={{ backgroundColor: palette.surface, marginTop: 8, marginBottom: 8, padding: 0, width: '100%', maxHeight: 340, borderRadius: 16, overflow: 'hidden' }}>
          <FlatList
            data={products}
            keyExtractor={item => item.id?.toString()}
            ListEmptyComponent={<Text color={palette.text} textAlign="center" m={3}>No hay productos agregados.</Text>}
            renderItem={({ item, index }) => (
              <Box
                key={item.id}
                flexDirection="row"
                alignItems="center"
                bg="#fff"
                shadow={2}
                borderRadius={16}
                py={14}
                mb={3}
                mx={2}
                width="100%"
                p={12}
                style={{ alignSelf: 'center' }}
              >
                {/* Sin imagen, solo info */}
                {/* Info principal */}
                <Box flex={1} justifyContent="center" ml={4}>
                  <Text color={palette.text} fontWeight="bold" fontSize={16} mb={1}>
                    {item.name || item.nombre || item.first_name || 'Sin nombre'}
                  </Text>
                  <Text color={palette.textSecondary} fontSize={13} mb={1}>
                    {
                      (() => {
                        // Buscar el nombre de la categoría por id
                        const catId = item.category || item.categoria;
                        if (!catId) return 'Sin categoría';
                        if (typeof catId === 'object' && catId.name) return catId.name;
                        const foundCat = categories.find(c => c.id === catId || c.id === Number(catId));
                        return foundCat ? foundCat.name : `Categoría: ${catId}`;
                      })()
                    }
                  </Text>
                  <Text color={palette.textSecondary} fontSize={12}>
                    Código: {item.code || item.codigo || item.id}
                  </Text>
                </Box>
                {/* Controles y precio: cantidad y precio uno debajo del otro, centrados */}
                <Box alignItems="center" justifyContent="center" minWidth={100}>
                  <Box flexDirection="column" alignItems="center" justifyContent="center">
                    <Box flexDirection="row" alignItems="center" mb={2}>
                      {item.qty > 1 ? (
                        <TouchableOpacity onPress={() => {
                          setProducts(products.map(p => p.id === item.id ? { ...p, qty: p.qty - 1 } : p));
                        }} style={{ paddingHorizontal: 6 }}>
                          <MaterialIcons name="remove-circle-outline" size={22} color="#e53935" />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => setProducts(products.filter(p => p.id !== item.id))} style={{ paddingHorizontal: 6 }}>
                          <MaterialIcons name="delete" size={22} color="#e53935" />
                        </TouchableOpacity>
                      )}
                      <FormInput
                        value={item.qty === 0 ? '' : String(item.qty)}
                        onChangeText={v => {
                          if (!window.qtyTimeouts) window.qtyTimeouts = {};
                          // Limpiar timeout anterior
                          if (window.qtyTimeouts[item.id]) clearTimeout(window.qtyTimeouts[item.id]);
                          if (v === '' || v === '0') {
                            setProducts(products.map(p => p.id === item.id ? { ...p, qty: 0 } : p));
                            // Colocar 1 después de 1 segundo si sigue vacío
                            window.qtyTimeouts[item.id] = setTimeout(() => {
                              setProducts(products => products.map(p => p.id === item.id ? { ...p, qty: 1 } : p));
                            }, 1000);
                            return;
                          }
                          const val = Math.max(1, parseInt(v.replace(/[^0-9]/g, '')) || 1);
                          setProducts(products.map(p => p.id === item.id ? { ...p, qty: val } : p));
                        }}
                        keyboardType="numeric"
                        style={{ minWidth: 48, maxWidth: 70, height: 22, textAlign: 'center', fontWeight: 'bold', fontSize: 15, paddingVertical: 0, paddingHorizontal: 0, borderRadius: 8, textAlignVertical: 'center' }}
                        backgroundColor={palette.input}
                        textColor={palette.text}
                      />
                      <TouchableOpacity onPress={() => {
                        setProducts(products.map(p => p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
                      }} style={{ paddingHorizontal: 6 }}>
                        <MaterialIcons name="add-circle-outline" size={22} color="#43a047" />
                      </TouchableOpacity>
                    </Box>
                    <Popover
                      isOpen={openPopoverIndex === index}
                      onOpen={() => setOpenPopoverIndex(index)}
                      onClose={() => setOpenPopoverIndex(null)}
                      trigger={triggerProps => (
                        <TouchableOpacity
                          {...triggerProps}
                          style={{ alignItems: 'center', marginTop: 8 }}
                          onPress={() => setOpenPopoverIndex(openPopoverIndex === index ? null : index)}
                        >
                          <Text color={palette.text} fontWeight="bold" fontSize={18} textAlign="center">
                            ${(item.sale_price * item.qty).toFixed(2)} USD
                          </Text>
                        </TouchableOpacity>
                      )}
                    >
                      <Popover.Content style={{ minWidth: 180, padding: 12 }}>
                        <Popover.Arrow />
                        <Popover.Header style={{ width: '100%', textAlign: 'center' }}>
                          <Text color={palette.text} fontWeight="bold" fontSize={16} textAlign="center">Precios en otras monedas</Text>
                        </Popover.Header>
                        <Popover.Body style={{ width: '100%' }}>
                          {(() => {
                            const priceUSD = (item.sale_price * item.qty).toFixed(2);
                            const usdToEur = 0.92;
                            const usdToCop = 4000;
                            const priceEUR = (item.sale_price * usdToEur * item.qty).toFixed(2);
                            const priceCOP = (item.sale_price * usdToCop * item.qty).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
                            // Unitario
                            const unitUSD = Number(item.sale_price).toFixed(2);
                            const unitEUR = (Number(item.sale_price) * usdToEur).toFixed(2);
                            const unitCOP = (Number(item.sale_price) * usdToCop).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
                            return (
                              <>
                                <Text color={palette.text} fontWeight="bold" fontSize={15} mb={1} textAlign="center">Precio unitario:</Text>
                                <Text color={palette.text} fontSize={15} mb={1} textAlign="center">${unitUSD} USD | €{unitEUR} EUR | {unitCOP} COP</Text>
                                <Text color={palette.text} fontWeight="bold" fontSize={15} mt={2} mb={1} textAlign="center">Total:</Text>
                                <Text color={palette.text} fontSize={16} mb={2} textAlign="center">${priceUSD} USD</Text>
                                <Text color={palette.textSecondary} fontSize={15} mb={2} textAlign="center">€{priceEUR} EUR</Text>
                                <Text color={palette.textSecondary} fontSize={15} textAlign="center">{priceCOP} COP</Text>
                              </>
                            );
                          })()}
                        </Popover.Body>
                      </Popover.Content>
                    </Popover>
                  </Box>
                </Box>
              </Box>
            )}
            showsVerticalScrollIndicator={true}
            style={{ width: '100%' }}
            contentContainerStyle={{ width: '100%' }}
          />
        </Box>
        {/* Recuento de items en el carrito */}
        {/* Resumen y botón de checkout */}
      {/* Tarjeta de resumen y barra de navegación fijas en la parte inferior */}
      </VStack>
      <Box position="absolute" left={0} right={0} bottom={0} zIndex={30} style={{ padding: 0, margin: 0 }}>
        {/* Tarjeta de resumen */}
  <Box bg={palette.card} borderRadius={12} p={16} width="95%" style={{ alignSelf: 'center', marginBottom: 150, marginLeft: '2.5%', marginRight: '2.5%' }}>
          <HStack justifyContent="space-between" mb={2}>
            <Text color={palette.textSecondary}>Items</Text>
            <Text color={palette.text}>{products.reduce((acc, p) => acc + p.qty, 0)}</Text>
          </HStack>
          <HStack justifyContent="space-between" mb={2}>
            <Text color={palette.textSecondary}>Subtotal</Text>
            <Text color={palette.text}>${subtotal.toFixed(2)}</Text>
          </HStack>
          <HStack justifyContent="space-between" mt={2}>
            <Text color={palette.text} fontWeight="bold" fontSize={18}>Total</Text>
            <Text color={palette.text} fontWeight="bold" fontSize={18}>${subtotal.toFixed(2)}</Text>
          </HStack>
          <Button
            mt={4}
            bg={isPressingPay ? palette.secondary : palette.primary}
            width="100%"
            isDisabled={products.length === 0}
            style={{ borderRadius: 8, marginTop: 16, alignSelf: 'center' }}
            onPressIn={() => {
              setIsPressingPay(true);
              setOpenPopoverIndex(null); // Cierra cualquier popover abierto
              let count = 3;
              setPressCountPay(count);
              pressIntervalPay.current = setInterval(() => {
                count--;
                setPressCountPay(count);
                if (count === 0) {
                  clearInterval(pressIntervalPay.current);
                  setIsPressingPay(false);
                  // Calcular subtotal y descuento si aplica
                  const subtotal = products.reduce((acc, p) => acc + (p.sale_price || p.price || 0) * (p.qty || p.quantity || 1), 0);
                  // Aquí podrías calcular el descuento real si tienes lógica
                  const discount = 0; // Ajusta si tienes lógica de descuento
                  navigation.navigate('CheckoutScreen', {
                    selectedClient: client,
                    selectedProducts: products,
                    total: subtotal,
                    discount,
                  });
                }
              }, 1000);
            }}
            onPressOut={() => {
              setIsPressingPay(false);
              setPressCountPay(3);
              if (pressIntervalPay.current) clearInterval(pressIntervalPay.current);
            }}
          >
            <Text color="#fff" fontWeight="bold" fontSize={16}>
              {isPressingPay ? ('Soltar en ' + pressCountPay + 's') : 'Procesar Pago'}
            </Text>
          </Button>
        </Box>
        {/* Barra de navegación */}
        <Box style={{ width: '100%' }}>
          <InternalTabBar />
        </Box>
      </Box>
      {/* BarcodeScannerModal ahora está fuera de cualquier modal/sheet */}
      <BarcodeScannerModal
        visible={showScanner}
        onScanned={handleBarCodeScanned}
        onClose={() => setShowScanner(false)}
        allProducts={allProducts}
        onAddProduct={async (product) => {
          const existing = products.find(p => p.id === product.id);
          if (existing) {
            setProducts(products.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p));
          } else {
            setProducts([...products, { ...product, qty: 1 }]);
          }
          try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch {}
          Toast.show({
            type: 'success',
            text1: 'Producto agregado',
            text2: product.name,
          });
        }}
        // No pasar autoCloseOnScan aquí, así el modal NO se cierra automáticamente
      />
    </Box>
  );
}
