import React, { useEffect, useState, useContext } from 'react';
import { Box, Text, VStack, HStack, Spinner } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { getPalette } from '../styles/theme';
import { ColorModeContext } from '../context/ColorModeContext';
import { getProducts } from '../services/api';

export default function StockAlertScreen() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const STOCK_THRESHOLD = 5;

  useEffect(() => {
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
    fetchProducts();
  }, []);

  const lowStock = products.filter(p => Number(p.stock_quantity) <= STOCK_THRESHOLD);

  return (
    <Box flex={1} bg={palette.surface} p={16}>
      <Text fontSize={22} fontWeight="bold" mb={4} color={palette.text}>Alertas de stock bajo</Text>
      <ScrollView>
        {loading ? (
          <Spinner size="large" color={palette.primary} />
        ) : lowStock.length === 0 ? (
          <Text color={palette.textSecondary} textAlign="center">No hay productos con stock bajo.</Text>
        ) : (
          <VStack space="md">
            {lowStock.map(product => (
              <Box key={product.id} bg={palette.card} borderRadius={12} p={12} mb={2} borderWidth={1} borderColor={palette.border}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Box>
                    <Text fontWeight="bold" color={palette.text}>{product.name}</Text>
                    <Text color={palette.textSecondary}>Código: {product.code}</Text>
                    <Text color={palette.textSecondary}>Stock: {product.stock_quantity}</Text>
                  </Box>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}
