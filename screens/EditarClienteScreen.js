import React, { useState, useContext, useEffect } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import {
  Box, VStack, Text, Button,
  Select, SelectItem, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator
} from '@gluestack-ui/themed';
import { FormInput } from '../components/FormInput';
import Toast from 'react-native-toast-message';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { getPrefixes } from '../services/api';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

const styles = StyleSheet.create({
  footerButtonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
  bottom: Platform.OS === 'android' ? 0 : 16,
    backgroundColor: '#fff',
  padding: 32,
    borderTopWidth: 1,
    borderColor: '#eee',
    zIndex: 10,
    alignItems: 'center',
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    // Elevación para Android
    elevation: 8,
  },
});

export default function EditarClienteScreen({ navigation, route }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();

  const client = route?.params?.client || {};
  const [editClient, setEditClient] = useState({
    name: client.first_name || '',
    lastName: client.last_name || '',
    id: client.identity_card || '',
    gender: client.gender || '',
    phone: client.contact_phone || '',
    address: client.address || '',
    prefix: client.prefix?.id ? String(client.prefix.id) : (client.prefix ? String(client.prefix) : '')
  });
  const [clientError, setClientError] = useState('');
  const [prefixes, setPrefixes] = useState([]);

  useEffect(() => {
    const accessToken = user?.access;
    getPrefixes(accessToken).then(data => {
      setPrefixes(Array.isArray(data) ? data : []);
    }).catch(() => setPrefixes([]));
  }, [user]);

  const handleUpdate = async () => {
    if (!editClient.name || !editClient.lastName || !editClient.id || !editClient.phone || !editClient.address || !editClient.prefix) {
      setClientError('Complete todos los campos.');
      return;
    }
    try {
      const accessToken = user?.access;
      const selectedPrefix = prefixes.find(p => String(p.id) === String(editClient.prefix));
      const data = {
        first_name: editClient.name,
        last_name: editClient.lastName,
        profile: {
          contact_phone: editClient.phone,
          address: editClient.address,
          prefix: selectedPrefix ? selectedPrefix.id : undefined,
        },
      };
      await apiFetch(
        `clients/${client.id}/edit/`,
        {
          method: 'PUT',
          body: JSON.stringify(data)
        },
        accessToken
      );
      Toast.show({ type: 'success', text1: 'Cliente actualizado' });
      navigation.goBack();
    } catch (e) {
      let msg = 'Error al actualizar el cliente.';
      if (e.message) msg = e.message;
      setClientError(msg);
    }
  };

  return (
    <Box flex={1} bg={palette.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
            <Text fontSize={22} fontWeight="bold" mb={16}>Editar Cliente</Text>
            <VStack space="md" flex={1}>
              <FormInput label="Nombre" value={editClient.name} onChangeText={v => setEditClient({ ...editClient, name: v })} />
              <FormInput label="Apellido" value={editClient.lastName} onChangeText={v => setEditClient({ ...editClient, lastName: v })} />
              <FormInput label="Cédula" value={editClient.id} onChangeText={v => setEditClient({ ...editClient, id: v })} keyboardType="numeric" />
              <FormInput label="Género" value={editClient.gender} onChangeText={v => setEditClient({ ...editClient, gender: v })} />
              <FormInput label="Dirección" value={editClient.address} onChangeText={v => setEditClient({ ...editClient, address: v })} />
              <Select selectedValue={editClient.prefix} onValueChange={v => setEditClient({ ...editClient, prefix: String(v) })} accessibilityLabel="Prefijo">
                <SelectTrigger>
                  <SelectInput
                    placeholder="Prefijo"
                    value={(() => {
                      const selected = prefixes.find(p => String(p.id) === String(editClient.prefix));
                      return selected ? `${selected.code} (${selected.company})` : '';
                    })()}
                  />
                  <SelectIcon as={MaterialIcons} name="arrow-drop-down" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {prefixes.map(pref => (
                      <SelectItem key={pref.id} label={`${pref.code} (${pref.company})`} value={String(pref.id)} />
                    ))}
                  </SelectContent>
                </SelectPortal>
              </Select>
              <FormInput label="Teléfono" value={editClient.phone} onChangeText={v => setEditClient({ ...editClient, phone: v })} keyboardType="numeric" />
            </VStack>
            {clientError ? <Text color={palette.error} mt={2}>{clientError}</Text> : null}
            <Box mt={24} mb={16}>
              <Button bg={palette.primary} onPress={handleUpdate}>
                <Text color="#fff">Guardar Cambios</Text>
              </Button>
            </Box>
          </ScrollView>
          <Box style={styles.footerButtonContainer} />
        </View>
      </KeyboardAvoidingView>
    </Box>
  );
}
