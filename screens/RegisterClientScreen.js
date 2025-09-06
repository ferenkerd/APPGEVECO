import React, { useState, useContext, useEffect } from 'react';
import {
  Box, VStack, Text, Button,
  Select, SelectItem, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator
} from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import Toast from 'react-native-toast-message';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { registerClient, getPrefixes } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RegisterClientScreen({ navigation, route }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();

  const cedulaInicial = route?.params?.cedula || '';
  const [newClient, setNewClient] = useState({ name: '', lastName: '', id: cedulaInicial, gender: '', phone: '', address: '', prefix: '' });
  const [clientError, setClientError] = useState('');
  const [prefixes, setPrefixes] = useState([]);

  useEffect(() => {
    const accessToken = user?.access;
    getPrefixes(accessToken).then(data => {
      setPrefixes(Array.isArray(data) ? data : []);
    }).catch(() => setPrefixes([]));
  }, [user]);

  const handleRegister = async () => {
    if (!newClient.name || !newClient.lastName || !newClient.id || !newClient.gender || !newClient.phone || !newClient.address || !newClient.prefix) {
      setClientError('Complete todos los campos.');
      return;
    }
    try {
      const accessToken = user?.access;
      const clientData = {
        first_name: newClient.name,
        profile: {
          last_name: newClient.lastName,
          identity_card: newClient.id,
          gender: newClient.gender,
          contact_phone: newClient.phone, // solo el número
          address: newClient.address,
          prefix: newClient.prefix, // aquí va el id
        }
      };
      await registerClient(clientData, accessToken);
      Toast.show({
        type: 'success',
        text1: 'Cliente registrado',
        text2: 'El cliente fue registrado exitosamente.',
        position: 'top',
        visibilityTime: 3000,
      });
  navigation.navigate('IdentificarCliente', { cedula: newClient.id });
    } catch (error) {
      setClientError('Error al registrar el cliente.');
      Toast.show({
        type: 'error',
        text1: 'Error al registrar',
        text2: 'No se pudo registrar el cliente.',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  return (
    <Box flex={1} bg={palette.surface} padding={16} justifyContent="center">
      <VStack space="lg" alignItems="center">
        <Text fontSize={22} fontWeight="bold" color={palette.text} mb={2} textAlign="center">
          Registrar nuevo cliente
        </Text>
        <Box width="100%" mb={2}>
          <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Nombre</Text>
          <FormInput
            placeholder="Ej: Juan"
            value={newClient.name}
            onChangeText={v => setNewClient({ ...newClient, name: v })}
            backgroundColor={palette.input}
            textColor={palette.text}
            style={{ width: '100%' }}
          />
        </Box>
        <Box width="100%" mb={2}>
          <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Apellido</Text>
          <FormInput
            placeholder="Ej: Pérez"
            value={newClient.lastName || ''}
            onChangeText={v => setNewClient({ ...newClient, lastName: v })}
            backgroundColor={palette.input}
            textColor={palette.text}
            style={{ width: '100%' }}
          />
        </Box>
        <Box width="100%" mb={2}>
          <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Cédula</Text>
          <FormInput
            placeholder="Ej: 12345678"
            value={newClient.id}
            onChangeText={v => setNewClient({ ...newClient, id: v })}
            keyboardType="numeric"
            backgroundColor={palette.input}
            textColor={palette.text}
            style={{ width: '100%' }}
          />
        </Box>
        <Box width="100%" mb={2}>
          <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Género</Text>
          <FormInput
            placeholder="Ej: M o F"
            value={newClient.gender || ''}
            onChangeText={v => setNewClient({ ...newClient, gender: v })}
            backgroundColor={palette.input}
            textColor={palette.text}
            style={{ width: '100%' }}
          />
        </Box>
        <Box width="100%" mb={2} flexDirection="row">
          <Box style={{ flex: 0.7, marginRight: 8 }}>
            <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Prefijo</Text>
            <Select
              selectedValue={newClient.prefix}
              onValueChange={v => setNewClient({ ...newClient, prefix: v })}
            >
              <SelectTrigger variant="outline" size="md">
                <SelectInput placeholder="Prefijo" />
                <SelectIcon as={MaterialIcons} name="arrow-drop-down" />
              </SelectTrigger>
              <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                  <SelectDragIndicatorWrapper>
                    <SelectDragIndicator />
                  </SelectDragIndicatorWrapper>
                  {prefixes.map((p) => (
                    <SelectItem
                      key={p.id}
                      label={p.code ? `0${p.code}` : p.id}
                      value={String(p.id)}
                    />
                  ))}
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
          <Box style={{ flex: 1 }}>
            <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Teléfono</Text>
            <FormInput
              placeholder="Ej: 1234567"
              value={newClient.phone}
              onChangeText={v => setNewClient({ ...newClient, phone: v })}
              keyboardType="phone-pad"
              backgroundColor={palette.input}
              textColor={palette.text}
              style={{ width: '100%' }}
            />
          </Box>
        </Box>
        <Box width="100%" mb={2}>
          <Text color={palette.textSecondary} fontSize={15} mb={2} ml={1}>Dirección</Text>
          <FormInput
            placeholder="Ej: Calle 1, Casa 2, Sector Centro"
            value={newClient.address || ''}
            onChangeText={v => setNewClient({ ...newClient, address: v })}
            backgroundColor={palette.input}
            textColor={palette.text}
            style={{ width: '100%' }}
          />
        </Box>
        {clientError ? (
          <Text color={palette.error} mt={2}>{clientError}</Text>
        ) : null}
        <Button mt={2} onPress={handleRegister} bg={palette.primary} width="100%">
          <Text color="#fff">Registrar</Text>
        </Button>
        <Button mt={2} variant="outline" borderColor={palette.primary} onPress={() => navigation.goBack()} width="100%">
          <Text color={palette.primary}>Cancelar</Text>
        </Button>
      </VStack>
    </Box>
  );
}
