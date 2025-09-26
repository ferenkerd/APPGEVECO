import React, { useContext, useState, useEffect } from 'react';
import { Box, Text, VStack, HStack, Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel, Spinner } from '@gluestack-ui/themed';
import { CustomButton } from '../components/CustomButton';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import TabHeader from '../components/TabHeader';
// Suponiendo que hay un servicio para obtener y actualizar el tipo de cobro
import { getPaymentMode, setPaymentMode } from '../services/api';
import { useAuth } from '../context/AuthContext';


export default function TipoCobroScreen({ navigation }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();
  const accessToken = user?.access;
  const [tipoCobro, setTipoCobroState] = useState(null); // 'admin' | 'cashier'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTipoCobro = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getPaymentMode(accessToken);
        setTipoCobroState(res?.mode || null);
      } catch (e) {
        setError('No se pudo cargar el tipo de cobro.');
      }
      setLoading(false);
    };
    if (accessToken) fetchTipoCobro();
  }, [accessToken]);

  const handleGuardar = async () => {
    setSaving(true);
    setError(null);
    try {
      await setPaymentMode(tipoCobro, accessToken);
      if (navigation && navigation.goBack) navigation.goBack();
    } catch (e) {
      setError('No se pudo guardar el tipo de cobro.');
    }
    setSaving(false);
  };

  return (
    <Box flex={1} bg={palette.surface}>
  <TabHeader title="Tipo de cobro" showMenu={false} hideMenu />
      <Box flex={1} px={20} py={24}>
        <Text fontSize={20} fontWeight="bold" mb={2} color={palette.text}>Tipo de cobro</Text>
        <Text color={palette.textSecondary} mb={6}>
          Define si el cobro es <Text fontWeight="bold">centralizado</Text> (solo el admin puede cobrar) o <Text fontWeight="bold">descentralizado</Text> (el cajero puede cobrar).
        </Text>
        {loading ? (
          <Spinner size="large" />
        ) : (
          <RadioGroup
            value={tipoCobro}
            onChange={setTipoCobroState}
            accessibilityLabel="Selecciona el tipo de cobro"
            mb={8}
          >
            <VStack space="md">
              <Radio value="admin">
                <RadioIndicator mr={2}>
                  <RadioIcon />
                </RadioIndicator>
                <RadioLabel color={palette.text}>Centralizado (solo admin puede cobrar)</RadioLabel>
              </Radio>
              <Radio value="cashier">
                <RadioIndicator mr={2}>
                  <RadioIcon />
                </RadioIndicator>
                <RadioLabel color={palette.text}>Descentralizado (el cajero puede cobrar)</RadioLabel>
              </Radio>
            </VStack>
          </RadioGroup>
        )}
        {error && <Text color="#ff4444" mb={2}>{error}</Text>}
        <CustomButton
          onPress={handleGuardar}
          backgroundColor={palette.primary}
          textColor={palette.background}
          isLoading={saving}
          isDisabled={loading || !tipoCobro}
          style={{ marginTop: 16 }}
        >
          Guardar
        </CustomButton>
      </Box>
    </Box>
  );
}
