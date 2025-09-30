
import React, { useEffect, useState } from 'react';
import { Box, VStack, HStack, Text, Input, InputField, Button, Switch, Spinner } from '@gluestack-ui/themed';
import Toast from 'react-native-toast-message';
import { getCurrencyRates, createCurrencyRate, patchCurrencyRate } from '../services/api';

export default function CurrencyRatesScreen({ route }) {
  const { currency } = route.params;
  const [loading, setLoading] = useState(false);
  const [manualRate, setManualRate] = useState(null);
  const [autoRate, setAutoRate] = useState(null);
  const [manualValue, setManualValue] = useState('');
  const [autoValue, setAutoValue] = useState('');
  const [manualActive, setManualActive] = useState(false);
  const [autoActive, setAutoActive] = useState(false);


    useEffect(() => {
      fetchRates();
    }, []);

    const fetchRates = async () => {
      setLoading(true);
      try {
        const rates = await getCurrencyRates(currency.id);
        // Filtrar solo tasas de esta moneda
        const filtered = Array.isArray(rates)
          ? rates.filter(r => r.currency && r.currency.id === currency.id)
          : [];
        // Tomar la tasa manual/autmática más reciente SOLO de la moneda seleccionada
        const manualRates = filtered.filter(r => r.source === 'manual' && r.currency.id === currency.id);
        const manual = manualRates.length > 0 ? manualRates.reduce((a, b) => (a.id > b.id ? a : b)) : null;
        const autoRates = filtered.filter(r => r.source === 'auto' && r.currency.id === currency.id);
        const auto = autoRates.length > 0 ? autoRates.reduce((a, b) => (a.id > b.id ? a : b)) : null;
        console.log('[TASA MANUAL]', manual);
        console.log('[TASA AUTO]', auto);
        setManualRate(manual || null);
        setAutoRate(auto || null);
        setManualValue(manual ? String(manual.rate) : '');
        setAutoValue(auto ? String(auto.rate) : '');
        setManualActive(manual ? manual.is_active : false);
        setAutoActive(auto ? auto.is_active : false);
      } catch {
        Toast.show({ type: 'error', text1: 'No se pudieron cargar las tasas' });
      }
      setLoading(false);
    };



  const handleManualSwitch = async (value) => {
    setLoading(true);
    try {
      if (manualRate) {
        await patchCurrencyRate(manualRate.id, { is_active: value });
      } else if (value) {
        // Si no existe, crearla solo si se activa
        const created = await createCurrencyRate({ rate: Number(manualValue) || 0, is_active: true, source: 'manual', currency: currency.id });
        setManualValue(String(created.rate));
      }
      // Si se activa manual, desactivar automática
      if (value && autoRate && autoRate.is_active) {
        await patchCurrencyRate(autoRate.id, { is_active: false });
      }
      setManualActive(value);
      if (value) setAutoActive(false);
      // Refresca valores después de cambios
      await fetchRates();
      // Si existe, asegura que el input muestre el valor actualizado
      if (manualRate) setManualValue(String(manualRate.rate));
    } catch {
      Toast.show({ type: 'error', text1: 'Error al actualizar tasa manual' });
    }
    setLoading(false);
  };


  const handleAutoSwitch = async (value) => {
    setLoading(true);
    try {
      if (autoRate) {
        await patchCurrencyRate(autoRate.id, { is_active: value });
      } else if (value) {
        const created = await createCurrencyRate(currency.id, { rate: Number(autoValue) || 0, is_active: true, source: 'auto' });
        setAutoValue(String(created.rate));
      }
      // Si se activa automática, desactivar manual
      if (value && manualRate && manualRate.is_active) {
        await patchCurrencyRate(manualRate.id, { is_active: false });
      }
      setAutoActive(value);
      if (value) setManualActive(false);
      await fetchRates();
      if (autoRate) setAutoValue(String(autoRate.rate));
    } catch {
      Toast.show({ type: 'error', text1: 'Error al actualizar tasa automática' });
    }
    setLoading(false);
  };

  const handleSaveManual = async () => {
    setLoading(true);
    try {
      if (manualRate) {
        await patchCurrencyRate(manualRate.id, { rate: Number(manualValue), is_active: manualActive });
      } else {
        await createCurrencyRate({ rate: Number(manualValue), is_active: manualActive, source: 'manual', currency: currency.id });
      }
      Toast.show({ type: 'success', text1: 'Tasa manual guardada' });
      fetchRates();
    } catch {
      Toast.show({ type: 'error', text1: 'Error al guardar tasa manual' });
    }
    setLoading(false);
  };

  const handleUpdateAuto = async () => {
    setLoading(true);
    try {
      let newRate = autoValue;
      if (currency.code === 'USDT') {
        // Llama al endpoint para obtener el valor de USDT
        const res = await axios.get('/usdt-binance/');
        if (res.data && res.data.usdt_binance) {
          newRate = String(res.data.usdt_binance);
          setAutoValue(newRate);
          if (autoRate) {
            await patchCurrencyRate(autoRate.id, {
              rate: Number(newRate),
              is_active: true,
              source: 'auto',
              currency: currency.id
            });
          } else {
            await createCurrencyRate({
              rate: Number(newRate),
              is_active: true,
              source: 'auto',
              currency: currency.id
            });
          }
          Toast.show({ type: 'success', text1: 'Tasa USDT actualizada desde Binance' });
        } else {
          Toast.show({ type: 'error', text1: 'No se pudo obtener el valor de USDT' });
        }
      } else {
        // Para otras monedas, solo refresca
        Toast.show({ type: 'info', text1: 'Solo USDT se actualiza automáticamente' });
      }
      fetchRates();
    } catch {
      Toast.show({ type: 'error', text1: 'Error al actualizar tasa automática' });
    }
    setLoading(false);
  };

  return (
    <Box flex={1} p={16} bg="#fff">
      <Text fontWeight="bold" fontSize={18} mb={4}>
        Gestión de tasas para {currency.name} ({currency.code})
      </Text>
      {loading ? (
        <HStack alignItems="center" justifyContent="center" py={2}>
          <Spinner />
          <Text ml={2}>Cargando tasas...</Text>
        </HStack>
      ) : null}
      <VStack space={6} mt={4}>
        {/* Tasa manual */}
        <Box p={4} borderWidth={1} borderColor="#eee" borderRadius={8} mb={2}>
          <Text fontWeight="bold" fontSize={16} mb={2}>Tasa manual</Text>
          <Input variant="outline" mb={2}>
            <InputField
              value={manualValue}
              placeholder="Valor de la tasa manual"
              keyboardType="decimal-pad"
              onChangeText={setManualValue}
            />
          </Input>
          <HStack alignItems="center" mb={2}>
            <Text mr={2}>Activa</Text>
            <Switch
              value={manualActive}
              onValueChange={handleManualSwitch}
              isChecked={manualActive}
              accessibilityLabel="Activar/desactivar tasa manual"
            />
          </HStack>
          <Button onPress={handleSaveManual} isDisabled={!manualActive || !manualValue}>
            <Text color="#fff">Guardar tasa manual</Text>
          </Button>
        </Box>

        {/* Tasa automática */}
        <Box p={4} borderWidth={1} borderColor="#eee" borderRadius={8}>
          <Text fontWeight="bold" fontSize={16} mb={2}>Tasa automática</Text>
          <Input variant="outline" mb={2}>
            <InputField
              value={autoValue}
              placeholder="Valor automático"
              keyboardType="decimal-pad"
              onChangeText={setAutoValue}
            />
          </Input>
          <HStack alignItems="center" mb={2}>
            <Text mr={2}>Activa</Text>
            <Switch
              value={autoActive}
              onValueChange={handleAutoSwitch}
              isChecked={autoActive}
              accessibilityLabel="Activar/desactivar tasa automática"
            />
          </HStack>
          <Button onPress={handleUpdateAuto} isDisabled={!autoActive}>
            <Text color="#fff">Actualizar tasa automática</Text>
          </Button>
        </Box>
      </VStack>
    </Box>
  );
}
