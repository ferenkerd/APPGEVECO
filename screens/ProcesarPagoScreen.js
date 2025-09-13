import React, { useState, useContext } from 'react';
import { Box, VStack, HStack, Text, Button, Select, SelectItem } from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';

export default function ProcesarPagoScreen({ navigation, route }) {
  const { client, products } = route.params;
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [paymentType, setPaymentType] = useState('');
  const [cashReceived, setCashReceived] = useState('');
  const [transferRef, setTransferRef] = useState('');
  const [currency, setCurrency] = useState('VES');

  const subtotal = products.reduce((sum, p) => sum + (parseFloat(p.sale_price) || 0) * p.qty, 0);
  const total = subtotal;
  const vuelto = paymentType === 'cash' && cashReceived ? Math.max(0, parseFloat(cashReceived) - total) : 0;

  return (
    <Box flex={1} bg={palette.surface} padding={16} justifyContent="center">
      <VStack space="lg" alignItems="center">
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="center">
          Procesar Pago
        </Text>
        <Text color={palette.text} mb={2}>Total a pagar: ${total.toFixed(2)}</Text>
        <VStack space="md" mb={3} width="100%">
          <Text color={palette.text} mb={1}>Seleccione método de pago:</Text>
          <HStack space="md">
            <Button
              variant={paymentType === 'cash' ? 'solid' : 'outline'}
              onPress={() => setPaymentType('cash')}
              bg={paymentType === 'cash' ? palette.primary : palette.input}
            >
              <Text color={paymentType === 'cash' ? '#fff' : palette.text}>Efectivo</Text>
            </Button>
            <Button
              variant={paymentType === 'transfer' ? 'solid' : 'outline'}
              onPress={() => setPaymentType('transfer')}
              bg={paymentType === 'transfer' ? palette.primary : palette.input}
            >
              <Text color={paymentType === 'transfer' ? '#fff' : palette.text}>Transferencia</Text>
            </Button>
            <Button
              variant={paymentType === 'other' ? 'solid' : 'outline'}
              onPress={() => setPaymentType('other')}
              bg={paymentType === 'other' ? palette.primary : palette.input}
            >
              <Text color={paymentType === 'other' ? '#fff' : palette.text}>Otro</Text>
            </Button>
          </HStack>
          {paymentType === 'cash' && (
            <VStack space="sm" mt={2}>
              <FormInput
                placeholder="Monto recibido"
                value={cashReceived}
                onChangeText={setCashReceived}
                keyboardType="numeric"
                backgroundColor={palette.input}
                textColor={palette.text}
              />
              <Text color={palette.text} mt={1}>Vuelto: ${vuelto.toFixed(2)}</Text>
            </VStack>
          )}
          {paymentType === 'transfer' && (
            <VStack space="sm" mt={2}>
              <FormInput
                placeholder="Referencia de transferencia"
                value={transferRef}
                onChangeText={setTransferRef}
                backgroundColor={palette.input}
                textColor={palette.text}
              />
            </VStack>
          )}
          <VStack mt={2} width="100%">
            <Text color={palette.text} mb={1}>Ver total en otra moneda:</Text>
            <Select
              selectedValue={currency}
              onValueChange={setCurrency}
              bg={palette.input}
              color={palette.text}
            >
              <SelectItem label="Bolívares (VES)" value="VES" />
              <SelectItem label="Dólares (USD)" value="USD" />
              <SelectItem label="Pesos (COP)" value="COP" />
            </Select>
            <Text color={palette.text} mt={1}>
              Total: {currency === 'VES' ? `Bs. ${(total * 157).toFixed(2)}` : currency === 'USD' ? `$${total.toFixed(2)}` : `COL$ ${(total * 4000).toFixed(2)}`}
            </Text>
          </VStack>
        </VStack>
        <Button mt={4} onPress={() => navigation.navigate('ResumenVenta', { client, products, total, paymentType, cashReceived, transferRef, currency })} bg={palette.primary} width="100%">
          <Text color="#fff">Finalizar Venta</Text>
        </Button>
      </VStack>
    </Box>
  );
}
