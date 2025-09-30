import React, { useState, useEffect } from 'react';
import {
  Box, Button, Text,
  Select, SelectItem, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator
} from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { FormInput } from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import { ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import BarcodeScannerButton from '../components/BarcodeScannerButton';
import BarcodeScannerModal from '../components/BarcodeScannerModal';

const RegistrarProductoScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [stockQuantity, setStockQuantity] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiFetch('/categories/', { method: 'GET' }, user?.access);
        setCategories(data);
      } catch {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudieron cargar las categorías' });
      }
    };
    fetchCategories();
  }, [user]);

  const handleRegister = async () => {
    setFormError('');
    if (!code || !name || !purchasePrice || !salePrice || !category || stockQuantity === '') {
      setFormError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        code,
        name,
        purchase_price: purchasePrice,
        sale_price: salePrice,
        category,
        stock_quantity: stockQuantity,
        is_active: isActive,
      };
      await apiFetch('products/', {
        method: 'POST',
        body: JSON.stringify(payload),
      }, user?.access);
      Toast.show({ type: 'success', text1: 'Producto registrado' });
      setCode(''); setName(''); setPurchasePrice(''); setSalePrice(''); setCategory(''); setStockQuantity(''); setIsActive(true);
    } catch (e) {
      setFormError('No se pudo registrar el producto.');
      Toast.show({ type: 'error', text1: 'Error', text2: 'No se pudo registrar el producto' });
    } finally {
      setLoading(false);
    }
  };

  const openScanner = () => setScannerVisible(true);
  const handleBarCodeScanned = (data) => {
    setCode(data);
    setScannerVisible(false);
    Toast.show({ type: 'success', text1: 'Código escaneado', text2: data });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <Box flex={1} bg="#f5f5f5" padding={16} justifyContent="center">
        <Box width="100%" maxWidth={400} alignSelf="center" bg="#fff" borderRadius={12} p={4} shadow={1}>
          <Text fontSize={22} fontWeight="bold" mb={2} textAlign="center">Registrar nuevo producto</Text>
          <Box width="100%" mb={2} flexDirection="row" alignItems="center">
            <Box flex={1} mr={2}>
              <Text color="#666" fontSize={15} mb={2} ml={1}>Código de barras</Text>
              <FormInput
                placeholder="Escanea o ingresa el código"
                value={code}
                onChangeText={setCode}
                autoCapitalize="none"
                backgroundColor="#f5f5f5"
                textColor="#111"
                style={{ width: '100%' }}
              />
            </Box>
            <BarcodeScannerButton onPress={openScanner} />
          </Box>
          <Box width="100%" mb={2}>
            <Text color="#666" fontSize={15} mb={2} ml={1}>Nombre</Text>
            <FormInput
              placeholder="Ej: Producto X"
              value={name}
              onChangeText={setName}
              backgroundColor="#f5f5f5"
              textColor="#111"
              style={{ width: '100%' }}
            />
          </Box>
          <Box width="100%" mb={2} flexDirection="row" alignItems="center">
            <Text color="#666" fontSize={15} mb={2} ml={1} mr={2}>Activo</Text>
            <Button
              variant="solid"
              size="sm"
              bg={isActive ? '#22c55e' : '#ef4444'}
              borderColor={isActive ? '#22c55e' : '#ef4444'}
              onPress={() => setIsActive(!isActive)}
              style={{ minWidth: 60 }}
            >
              <Text color="#fff" fontWeight="bold">{isActive ? 'Sí' : 'No'}</Text>
            </Button>
          </Box>
          <Box width="100%" mb={2}>
            <Text color="#666" fontSize={15} mb={2} ml={1}>Precio de compra</Text>
            <FormInput
              placeholder="Ej: 10.00"
              value={purchasePrice}
              onChangeText={setPurchasePrice}
              keyboardType="numeric"
              backgroundColor="#f5f5f5"
              textColor="#111"
              style={{ width: '100%' }}
            />
          </Box>
          <Box width="100%" mb={2}>
            <Text color="#666" fontSize={15} mb={2} ml={1}>Cantidad en stock</Text>
            <FormInput
              placeholder="Ej: 100"
              value={stockQuantity}
              onChangeText={setStockQuantity}
              keyboardType="numeric"
              backgroundColor="#f5f5f5"
              textColor="#111"
              style={{ width: '100%' }}
            />
          </Box>
          <Box width="100%" mb={2}>
            <Text color="#666" fontSize={15} mb={2} ml={1}>Precio de venta</Text>
            <FormInput
              placeholder="Ej: 15.00"
              value={salePrice}
              onChangeText={setSalePrice}
              keyboardType="numeric"
              backgroundColor="#f5f5f5"
              textColor="#111"
              style={{ width: '100%' }}
            />
          </Box>
          <Box width="100%" mb={2}>
            <Text color="#666" fontSize={15} mb={2} ml={1}>Categoría</Text>
            <Select
              selectedValue={category}
              onValueChange={setCategory}
            >
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder="Selecciona una categoría" value={(() => {
                  const cat = categories.find(c => String(c.id) === String(category));
                  return cat ? cat.name : '';
                })()} />
                <SelectIcon as={MaterialIcons} name="arrow-drop-down" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent style={{ paddingBottom: 40 }}>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      label={cat.name}
                      value={cat.id.toString()}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
          {formError ? (
            <Text color="#d32f2f" mt={2}>{formError}</Text>
          ) : null}
          <Button mt={2} onPress={handleRegister} bg="#111" width="100%" isDisabled={loading}>
            <Text color="#fff">{loading ? 'Registrando...' : 'Registrar'}</Text>
          </Button>
          <Button mt={2} variant="outline" borderColor="#111" onPress={() => navigation.goBack()} width="100%">
            <Text color="#111">Cancelar</Text>
          </Button>
        </Box>
        <BarcodeScannerModal
          visible={scannerVisible}
          onScanned={handleBarCodeScanned}
          onClose={() => setScannerVisible(false)}
        />
      </Box>
    </KeyboardAvoidingView>
  );
};

export default RegistrarProductoScreen;
