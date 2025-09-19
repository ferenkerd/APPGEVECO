import React, { useContext } from 'react';
import { Box, VStack, Text, Button, Divider, HStack } from '@gluestack-ui/themed';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';

export default function ResumenVentaScreen({ navigation, route }) {
  const { venta, client, products, total, paymentType, currency } = route.params;
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const fecha = venta?.created_at ? new Date(venta.created_at) : new Date();

  return (
    <Box flex={1} bg={palette.surface} padding={16} justifyContent="center">
      <VStack space="md" alignItems="center" width="100%">
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="center">
          Recibo de Operación
        </Text>
        <Text color={palette.text} fontSize={15} mb={1}>Operación N°: {venta?.id || '--'}</Text>
        <Text color={palette.text} fontSize={15} mb={1}>Fecha: {fecha.toLocaleString()}</Text>
        <Divider my={2} width="100%" />
        <Text color={palette.text} fontWeight="bold" mb={1}>Cliente</Text>
        <Text color={palette.text}>{client?.first_name} {client?.last_name} ({client?.id})</Text>
        {client?.identity_card && <Text color={palette.text}>Cédula: {client.identity_card}</Text>}
        {client?.contact_phone && <Text color={palette.text}>Tel: {client.prefix?.code ? `+${client.prefix.code} ` : ''}{client.contact_phone}</Text>}
        <Divider my={2} width="100%" />
        <Text color={palette.text} fontWeight="bold" mb={1}>Productos</Text>
        <VStack width="100%" space="xs">
          {products.map((p, idx) => (
            <HStack key={idx} justifyContent="space-between" width="100%">
              <Text color={palette.text}>{p.name} x{p.qty || p.quantity || 1}</Text>
              <Text color={palette.text}>${Number(p.sale_price || p.price || 0) * (p.qty || p.quantity || 1)}</Text>
            </HStack>
          ))}
        </VStack>
        <Divider my={2} width="100%" />
        <HStack justifyContent="space-between" width="100%">
          <Text color={palette.text}>Total:</Text>
          <Text color={palette.text} fontWeight="bold">${total}</Text>
        </HStack>
        <HStack justifyContent="space-between" width="100%">
          <Text color={palette.text}>Método de pago:</Text>
          <Text color={palette.text}>{paymentType === 'cash' ? 'Efectivo' : paymentType === 'card' ? 'Tarjeta' : paymentType === 'transfer' ? 'Transferencia' : paymentType}</Text>
        </HStack>
        <Button mt={4} onPress={() => navigation.popToTop()} bg={palette.primary} width="100%">
          <Text color="#fff">Nueva Venta</Text>
        </Button>
      </VStack>
    </Box>
  );
}
