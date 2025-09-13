import React, { useState, useContext, useRef } from 'react';

import { Box, VStack, HStack, Text, Button, Modal, ModalBackdrop, ModalContent } from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { searchClientByCedula } from '../services/api';
import Toast from 'react-native-toast-message';
import { useAuth } from '../context/AuthContext';

export default function IdentificarClienteScreen({ navigation, route }) {
  // Estado y ref para efecto de botón presionado en 'Registrar nuevo cliente'
  const [isPressingRegister, setIsPressingRegister] = useState(false);
  const [pressCountRegister, setPressCountRegister] = useState(3);
  const pressIntervalRegister = useRef();
  // Estado y ref para efecto de botón presionado
  const [isPressing, setIsPressing] = useState(false);
  const [pressCount, setPressCount] = useState(3);
  const pressInterval = useRef();
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();
  const [clientId, setClientId] = useState('');
  const [client, setClient] = useState(null);
  const [clientError, setClientError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

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
        setShowClientModal(true);
        Toast.show({
          type: 'success',
          text1: 'Cliente encontrado',
          text2: `${data.first_name} ${data.last_name} (${data.identity_card})`,
          position: 'top',
          visibilityTime: 3000,
        });
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
    <Box flex={1} bg={palette.surface} padding={16} justifyContent="flex-start" alignItems="center">
      <VStack space="lg" alignItems="center" width="100%">
  <Box width="100%" mt={120} mb={4}>
          <Text fontSize={22} fontWeight="bold" color={palette.text} mb={4} textAlign="center">
            Identificar Cliente
          </Text>
          <Text color={palette.textSecondary} fontSize={15} mb={3} ml={1}>
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
          <Button mt={4} onPress={handleSearchClient} bg={palette.primary} width="100%" isDisabled={loading}>
            <Text color="#fff">Buscar</Text>
          </Button>
        </Box>
  <Box mt={10} width="100%">
          {client && (
            (() => { console.log('CLIENTE:', client); return null; })()
          )}
        </Box>
        {/* Modal tipo card para mostrar datos del cliente */}
        <Modal isOpen={showClientModal} onClose={() => setShowClientModal(false)}>
          <ModalBackdrop />
          <ModalContent style={{ borderRadius: 16, padding: 0, backgroundColor: palette.surface, minWidth: 300, minHeight: 270, overflow: 'hidden' }}>
            {/* Título fijo arriba */}
            <Box width="100%" p={20} pb={12} alignItems="center">
              <Text color={palette.text} fontWeight="bold" fontSize={22}>Cliente encontrado</Text>
            </Box>
            {/* Contenido en formato tabla con bordes y fondo alterno */}
            <Box borderRadius={16} mb={4} mt={8} mx={8} flex={1} borderWidth={1} borderColor={palette.secondary} bg={palette.surface}>
              <VStack flex={1} justifyContent="center" py={16} width="100%" px={8}>
                <Box width="100%" flexDirection="row" alignItems="center" justifyContent="space-between" borderBottomWidth={1} borderColor={palette.input} bg={palette.surface} py={8} px={16} borderRadius={12}>
                  <Text color={palette.textSecondary} fontWeight="bold">Nombre</Text>
                  <Text color={palette.text} textAlign="right">{client?.first_name} {client?.last_name}</Text>
                </Box>
                <Box width="100%" flexDirection="row" alignItems="center" justifyContent="space-between" borderBottomWidth={1} borderColor={palette.input} bg="#f7f7f7" py={8} px={16} borderRadius={12}>
                  <Text color={palette.textSecondary} fontWeight="bold">Cédula</Text>
                  <Text color={palette.text} textAlign="right">{client?.identity_card}</Text>
                </Box>
                <Box width="100%" flexDirection="row" alignItems="center" justifyContent="space-between" bg={palette.surface} py={8} px={16} borderRadius={12}>
                  <Text color={palette.textSecondary} fontWeight="bold">Teléfono</Text>
                  <Text color={palette.text} textAlign="right">{client?.prefix?.code}-{client?.contact_phone}</Text>
                </Box>
              </VStack>
            </Box>
            {/* Botones fijos abajo */}
            <Box width="100%" p={16} pt={16} >
              <HStack space="md" width="100%" justifyContent="space-between">
                <Button flex={1} mr={2} variant="outline" borderColor={palette.primary} onPress={() => setShowClientModal(false)}>
                  <Text color={palette.primary}>Cancelar</Text>
                </Button>
                <Button
                  flex={1}
                  ml={2}
                  bg={isPressing ? palette.secondary : palette.primary}
                  onPressIn={() => {
                    setIsPressing(true);
                    let count = 3;
                    setPressCount(count);
                    pressInterval.current = setInterval(() => {
                      count--;
                      setPressCount(count);
                      if (count === 0) {
                        clearInterval(pressInterval.current);
                        setIsPressing(false);
                        setShowClientModal(false);
                        navigation.navigate('AgregarProductos', { client });
                      }
                    }, 1000);
                  }}
                  onPressOut={() => {
                    setIsPressing(false);
                    setPressCount(3);
                    if (pressInterval.current) clearInterval(pressInterval.current);
                  }}
                >
                  <Text color="#fff">
                    {isPressing ? `Soltar en ${pressCount}s` : 'Continuar'}
                  </Text>
                </Button>
              </HStack>
            </Box>
          </ModalContent>
        </Modal>
        {clientError ? (
          <Text color={palette.error} mt={2}>{clientError}</Text>
        ) : null}
      </VStack>
      <Box position="absolute" left={0} right={0} bottom={120} px={16} pb={16} bg="transparent">
        <Button
          variant="outline"
          borderColor={palette.primary}
          width="100%"
          alignSelf="center"
          onPress={() => navigation.navigate('RegisterClient')}
        >
          <Text color={palette.primary}>Registrar nuevo cliente</Text>
        </Button>
      </Box>
    </Box>
  );
}
