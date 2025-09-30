import React, { useEffect, useState, useContext } from 'react';
import { Box, Text, VStack, HStack, Divider, Spinner, Button, Input, InputField, Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@gluestack-ui/themed';
import { ScrollView, RefreshControl } from 'react-native';
import { getPalette } from '../styles/theme';
import { ColorModeContext } from '../context/ColorModeContext';
import { getProducts } from '../services/api';

export default function ProductListScreen({ navigation }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (navigation.getState && navigation.getState().routes) {
        const currentRoute = navigation.getState().routes.find(r => r.name === 'ProductList');
        if (currentRoute && currentRoute.params && currentRoute.params.refresh) {
          fetchProducts();
          navigation.setParams({ refresh: false });
        }
      }
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts().then(() => setRefreshing(false));
  };

  const filteredProducts = products.filter(product => {
    const q = search.toLowerCase();
    if (!q) return true;
    const name = (product.name || '').toLowerCase();
    const code = (product.code || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    if (searchField === 'all') {
      return name.includes(q) || code.includes(q) || category.includes(q);
    } else if (searchField === 'name') {
      return name.includes(q);
    } else if (searchField === 'code') {
      return code.includes(q);
    } else if (searchField === 'category') {
      return category.includes(q);
    }
    return true;
  });

  return (
    <Box flex={1} bg={palette.surface}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text fontSize={20} fontWeight="600" mb={2} color={palette.text} paddingBottom={12}>Catálogo de productos</Text>
        <HStack alignItems="center" space="sm" mb={3}>
          <Box style={{ width: 120, minWidth: 90, maxWidth: 140, marginRight: 8 }}>
            <Select
              selectedValue={searchField}
              onValueChange={setSearchField}
              accessibilityLabel="Filtrar por"
              triggerProps={{ style: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', height: 40, justifyContent: 'center', alignItems: 'center', padding: 0 } }}
            >
              <SelectTrigger style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', height: 40, justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                <SelectInput placeholder="Campo" value={(() => {
                  if (searchField === 'all') return 'Todos';
                  if (searchField === 'name') return 'Nombre';
                  if (searchField === 'code') return 'Código';
                  if (searchField === 'category') return 'Categoría';
                  return '';
                })()} />
                <SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: '100%', maxHeight: '80%', minHeight: '50%', paddingBottom: 24}}>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  <Box style={{ width: '100%', maxWidth: '100%', paddingBottom: 24 }}>
                    <SelectItem label="Todos" value="all" />
                    <SelectItem label="Nombre" value="name" />
                    <SelectItem label="Código" value="code" />
                    <SelectItem label="Categoría" value="category" />
                  </Box>
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
          <Box style={{ flex: 1 }}>
            <Input bg="#f5f5f5" borderRadius={12} px={0} style={{ paddingRight: 36 }}>
              <InputField
                placeholder={
                  searchField === 'all' ? 'Buscar...' :
                  searchField === 'name' ? 'Buscar por nombre...' :
                  searchField === 'code' ? 'Buscar por código...' :
                  searchField === 'category' ? 'Buscar por categoría...' :
                  'Buscar...'
                }
                value={search}
                onChangeText={setSearch}
                autoCorrect={false}
                autoCapitalize="none"
                style={{ paddingRight: 36 }}
              />
            </Input>
          </Box>
        </HStack>
        <Divider mb={2} />
        {loading ? (
          <Spinner size="large" color={palette.primary} />
        ) : filteredProducts.length === 0 ? (
          <Text color={palette.textSecondary} textAlign="center">No hay productos registrados.</Text>
        ) : (
          <VStack space="md">
            {filteredProducts.map(product => (
              <Box
                key={product.id}
                bg={palette.card}
                borderRadius={12}
                p={12}
                mb={2}
                borderWidth={1}
                borderColor={palette.border}
              >
                <Text fontWeight="bold" color={palette.text}>{product.name}</Text>
                <Text color={palette.textSecondary}>Código: {product.code}</Text>
                <Text color={palette.textSecondary}>Categoría: {product.category}</Text>
                {/* Agrega más campos si es necesario */}
                <Button
                  size="md"
                  variant="solid"
                  backgroundColor={palette.primary}
                  onPress={() => navigation.navigate('ProductDetail', { product })}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  <Text color={palette.background} fontWeight="bold">Ver o Editar</Text>
                </Button>
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
