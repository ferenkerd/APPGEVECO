import React, { useState, useContext, useEffect } from 'react';
import { Box, Text, VStack, HStack, Button, Input, InputField, Divider, Spinner, Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { getPalette } from '../styles/theme';
import { ColorModeContext } from '../context/ColorModeContext';
import { patchProduct, getCategories } from '../services/api';
import Toast from 'react-native-toast-message';


export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [form, setForm] = useState({
    name: product.name || '',
    code: product.code || '',
    category: product.category || '', // id de categoría
    sale_price: product.sale_price || '',
    stock_quantity: product.stock_quantity || '',
    purchase_price: product.purchase_price || '',
    is_active: typeof product.is_active === 'boolean' ? product.is_active : true,
  });
  const [categories, setCategories] = useState([]);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  useEffect(() => {
    getCategories().then(data => {
      setCategories(Array.isArray(data) ? data : []);
    });
  }, []);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Solo enviar los campos relevantes, incluyendo is_active
      const payload = {
        name: form.name,
        code: form.code,
        category: form.category,
        sale_price: form.sale_price,
        stock_quantity: form.stock_quantity,
        purchase_price: form.purchase_price,
        is_active: form.is_active,
      };
      await patchProduct(product.id, payload);
      Toast.show({ type: 'success', text1: 'Producto actualizado', position: 'top', visibilityTime: 2200 });
      navigation.navigate('ProductList', { refresh: true });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error al actualizar', text2: 'No se pudo actualizar el producto.', position: 'top', visibilityTime: 3000 });
    }
    setLoading(false);
  };

  return (
    <Box flex={1} bg={palette.surface}>
      <ScrollView contentContainerStyle={{ padding: 16, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <Box flex={1}>
          <Text fontSize={22} fontWeight="bold" mb={2} textAlign="center">Editar producto</Text>
          <Divider mb={2} />
          <VStack space="md" mt={4}>
            <Text fontWeight="bold" color={palette.text} mb={-2}>Nombre</Text>
            <Input variant="outline" mb={2}>
              <InputField value={form.name} placeholder="Nombre" onChangeText={v => handleChange('name', v)} />
            </Input>

            <HStack alignItems="center" space="md" mb={2}>
              <Text fontWeight="bold" color={palette.text}>Activo</Text>
              <Button
                variant="solid"
                size="sm"
                backgroundColor={form.is_active ? '#22c55e' : '#ef4444'}
                borderColor={form.is_active ? '#22c55e' : '#ef4444'}
                onPress={() => handleChange('is_active', !form.is_active)}
              >
                <Text color={palette.background} fontWeight="bold">
                  {form.is_active ? 'Sí' : 'No'}
                </Text>
              </Button>
            </HStack>
            <Text fontWeight="bold" color={palette.text} mb={-2}>Código</Text>
            <Input variant="outline" mb={2}>
              <InputField value={form.code} placeholder="Código" onChangeText={v => handleChange('code', v)} />
            </Input>
            <Text fontWeight="bold" color={palette.text} mb={-2}>Categoría</Text>
            <Select
              selectedValue={form.category}
              onValueChange={v => handleChange('category', v)}
              accessibilityLabel="Selecciona categoría"
              mb={2}
            >
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder="Categoría" value={(() => {
                  const cat = categories.find(c => String(c.id) === String(form.category));
                  return cat ? cat.name : '';
                })()} />
                <SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent style={{ paddingBottom: 48 }}>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} label={cat.name} value={String(cat.id)} />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
            <Text fontWeight="bold" color={palette.text} mb={-2}>Precio de venta</Text>
            <Input variant="outline" mb={2}>
              <InputField value={String(form.sale_price)} placeholder="Precio de venta" keyboardType="numeric" onChangeText={v => handleChange('sale_price', v)} />
            </Input>

            <Text fontWeight="bold" color={palette.text} mb={-2}>Precio de compra</Text>
            <Input variant="outline" mb={2}>
              <InputField value={String(form.purchase_price)} placeholder="Precio de compra" keyboardType="numeric" onChangeText={v => handleChange('purchase_price', v)} />
            </Input>

            <Text fontWeight="bold" color={palette.text} mb={-2}>Cantidad en stock</Text>
            <Input variant="outline" mb={2}>
              <InputField value={String(form.stock_quantity)} placeholder="Cantidad en stock" keyboardType="numeric" onChangeText={v => handleChange('stock_quantity', v)} />
            </Input>
          </VStack>
          <Button width="100%" size="lg" variant="solid" backgroundColor={palette.primary} onPress={handleSave} isDisabled={loading} style={{ marginTop: 32 }}>
            {loading ? <Spinner color="#fff" /> : <Text color={palette.background} fontWeight="bold">Guardar cambios</Text>}
          </Button>
        </Box>
      </ScrollView>
    </Box>
  );
}
