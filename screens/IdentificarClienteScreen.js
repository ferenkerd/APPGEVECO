import React, { useState, useContext } from 'react';
import { Box, VStack, HStack, Text, Button } from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { searchClientByCedula } from '../services/api';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

export default function IdentificarClienteScreen({ navigation, route }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();
  const [clientId, setClientId] = useState('');
  const [client, setClient] = useState(null);
  const [clientError, setClientError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearchClient = async () => {
    setClientError('');
    setClient(null);
    if (!clientId) {
      setClientError('Ingrese la cédula del cliente.');
      Toast.show({
        type: 'error',
        text1: 'Campo requerido',
        text2: 'Ingrese la cédula del cliente.',
        position: 'top',
        visibilityTime: 3000,
      });
      return;
    }
    setLoading(true);
    try {
      const accessToken = user?.access;
      const data = await searchClientByCedula(clientId, accessToken);
      if (data && data.id) {
        setClient(data);
      } else {
        setClientError('Cliente no encontrado.');
        Toast.show({
          type: 'error',
          text1: 'Cliente no encontrado',
          text2: 'Verifica la cédula o registra un nuevo cliente.',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } catch (error) {
      setClientError('Error al buscar el cliente.');
      Toast.show({
        type: 'error',
        text1: 'Error de red',
        text2: 'No se pudo buscar el cliente. Intenta de nuevo.',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box flex={1} bg={palette.surface} padding={16} justifyContent="center">
  <VStack space="lg" alignItems="center" width="100%">
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="center">
          Identificar Cliente
        </Text>
        <Box width="100%" mb={2}>
          <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>
            Cédula del cliente
          </Text>
              <FormInput
                placeholder="Ej: 12345678"
                value={route?.params?.cedula || clientId}
                onChangeText={setClientId}
                keyboardType="numeric"
                backgroundColor={palette.input}
                textColor={palette.text}
                style={{ width: '100%' }}
              />
        </Box>
        <Button onPress={handleSearchClient} bg={palette.primary} width="100%" isDisabled={loading}>
          <Text color="#fff">Buscar</Text>
        </Button>
        {client && (
          <Box bg={palette.surface} p={3} borderRadius={8} mt={4} width="100%">
            <Text color={palette.text} fontWeight="bold" fontSize={16} mb={1}>Cliente encontrado</Text>
            <Text color={palette.text}>Nombre: {client.name}</Text>
            <Text color={palette.text}>Cédula: {client.id}</Text>
            <Text color={palette.text}>Teléfono: {client.phone}</Text>
            <Button mt={2} onPress={() => navigation.navigate('AgregarProductos', { client })} bg={palette.primary}>
              <Text color="#fff">Continuar</Text>
            </Button>
          </Box>
        )}
        {clientError ? (
          <Text color={palette.error} mt={2}>{clientError}</Text>
        ) : null}
        <Button mt={2} variant="outline" borderColor={palette.primary} onPress={() => navigation.navigate('RegisterClient')} width="100%">
          <Text color={palette.primary}>Registrar nuevo cliente</Text>
        </Button>
      </VStack>
    </Box>
  );
}
