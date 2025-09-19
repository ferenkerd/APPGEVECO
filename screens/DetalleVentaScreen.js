import React from 'react';
import { Box, Text, VStack, HStack, Divider, Button, ScrollView } from '@gluestack-ui/themed';

export default function DetalleVentaScreen({ route, navigation }) {
  const { venta } = route.params;
  return (
    <Box flex={1} bg="#fff">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
  <Text fontSize={22} fontWeight="bold" mb={12}>Detalle de Operación #{venta.id}</Text>
        <Text mb={2}>Cliente: {venta.client && typeof venta.client === 'object' ? `${venta.client.first_name || ''} ${venta.client.last_name || ''}` : (venta.client_name || venta.client || '')}</Text>
  <Text mb={2}>Total: ${venta.total_amount}</Text>
  <Text mb={2}>Status: {venta.status}</Text>
        <Divider my={8} />
        <Text fontWeight="bold" mb={4}>Productos:</Text>
        <VStack space="xs" mb={8}>
          {venta.details && venta.details.length > 0 ? venta.details.map((item, idx) => {
            const qty = item.product_quantity || 1;
            const price = Number(item.sale_price_at_time_of_sale || 0);
            const total = price * qty;
            const nombre = item.product && item.product.name ? item.product.name : 'Producto';
            return (
              <HStack key={idx} justifyContent="space-between" alignItems="center">
                <Text>{nombre} x{qty}</Text>
                <Text>${total.toFixed(2)}</Text>
              </HStack>
            );
          }) : <Text color="#888">Sin productos</Text>}
        </VStack>
        <Button onPress={() => navigation.goBack()} mt={4} bg="#111" borderRadius={8}>
          <Text color="#fff" fontWeight="bold">Cerrar</Text>
        </Button>
      </ScrollView>
    </Box>
  );
}
