import React, { useContext } from 'react';
import { Box, VStack, Text, Button } from '@gluestack-ui/themed';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';

export default function ResumenVentaScreen({ navigation, route }) {
  const { client, products, total, paymentType, cashReceived, transferRef, currency } = route.params;
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  return (
    <Box flex={1} bg={palette.surface} padding={16} justifyContent="center">
      <VStack space="lg" alignItems="center">
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="center">
          Venta Finalizada
        </Text>
        <Text color={palette.text} mb={2}>Cliente: {client?.first_name} {client?.last_name} {client?.lastname} ({client?.id})</Text>
        <Text color={palette.text} mb={2}>Total: {currency === 'VES' ? `Bs. ${(total * 36).toFixed(2)}` : currency === 'USD' ? `$${total.toFixed(2)}` : `COL$ ${(total * 4000).toFixed(2)}`}</Text>
        <Text color={palette.text} mb={2}>Método de pago: {paymentType}</Text>
        {paymentType === 'cash' && <Text color={palette.text}>Recibido: {cashReceived}</Text>}
        {paymentType === 'transfer' && <Text color={palette.text}>Referencia: {transferRef}</Text>}
        <Text color={palette.text} mb={2}>Productos:</Text>
        {products.map((p) => (
          <Text key={p.id} color={palette.text}>{p.name} x{p.qty} - ${p.price * p.qty}</Text>
        ))}
        <Button mt={4} onPress={() => navigation.popToTop()} bg={palette.primary} width="100%">
          <Text color="#fff">Nueva Venta</Text>
        </Button>
      </VStack>
    </Box>
  );
}
