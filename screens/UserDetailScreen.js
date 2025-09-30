// Lista de roles/puestos de trabajo (puedes reemplazar por fetch a la API si tienes endpoint)
const jobPositions = [
  { id: 1, name: 'Administrador' },
  { id: 2, name: 'Almacenista' },
  { id: 3, name: 'Cajero' }
];
// Agrega más roles según tu backend

import React, { useContext, useState, useEffect } from 'react';
// Formatea una fecha ISO a DD/MM/YYYY HH:mm
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const pad = n => n.toString().padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
import { Box, Text, VStack, HStack, Button, Divider, Input, InputField, Select, SelectItem, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator } from '@gluestack-ui/themed';
import { useAuth } from '../context/AuthContext';
import { getPrefixes, patchUser } from '../services/api';
import Toast from 'react-native-toast-message';
import { ScrollView } from 'react-native';
import { getPalette } from '../styles/theme';
import { ColorModeContext } from '../context/ColorModeContext';


export default function UserDetailScreen({ route, navigation }) {
  const [prefixes, setPrefixes] = useState([]);
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user: authUser } = useAuth();
  const { user } = route.params;

  // Estado local editable para cada campo
  const [form, setForm] = useState({
  username: user.username || '',
  email: user.email || '',
  is_active: user.is_active !== undefined ? user.is_active : true,
  is_staff: user.is_staff || false,
  is_superuser: user.is_superuser || false,
  date_joined: user.date_joined || '',
  last_login: user.last_login || '',
  // job_position puede ser objeto
  job_position_id: user.job_position?.id || '',
  job_position_name: user.job_position?.name || '',
  job_position_description: user.job_position?.description || '',
  // profile puede ser objeto
  profile_id: user.profile?.id || '',
  identity_card: user.profile?.identity_card || '',
  // Usar user.first_name si existe, si no user.profile?.first_name
  first_name: user.first_name || user.profile?.first_name || '',
  last_name: user.profile?.last_name || '',
  gender: user.profile?.gender || '',
  contact_phone: user.profile?.contact_phone || '',
  address: user.profile?.address || '',

  prefix: user.profile?.prefix || '',
  });

  // Cargar prefijos desde la API al montar
  React.useEffect(() => {
    const accessToken = authUser?.access;
    getPrefixes(accessToken).then(data => {
      setPrefixes(Array.isArray(data) ? data : []);
    }).catch(() => setPrefixes([]));
  }, [authUser]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPrefix = (id, name) => {
    setForm((prev) => ({ ...prev, prefix: id, prefix_name: name }));
    setShowPrefixSheet(false);
  };

  return (
    <Box flex={1} bg={palette.surface}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Text fontSize={24} fontWeight="bold" mb={2} mt={4} textAlign="center" color={palette.text}>
        Gestión de usuario
      </Text>
      <Divider mb={2} />
      <VStack space="md" mt={4}>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Usuario</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.username} placeholder="Usuario" onChangeText={v => handleChange('username', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Email</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.email} placeholder="Email" onChangeText={v => handleChange('email', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Fecha de registro</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={formatDate(form.date_joined)} placeholder="Fecha de registro" editable={false} />
          </Input>
        <HStack space="md" alignItems="center">
          <Text color={palette.text}>Activo:</Text>
          <Button
            size="sm"
            variant={form.is_active ? 'solid' : 'outline'}
            backgroundColor={form.is_active ? '#2ecc40' : '#e74c3c'}
            borderColor={form.is_active ? '#2ecc40' : '#e74c3c'}
            onPress={() => handleChange('is_active', !form.is_active)}
          >
            <Text color={form.is_active ? '#fff' : '#fff'}>{form.is_active ? 'Sí' : 'No'}</Text>
          </Button>
        </HStack>
        <Divider my={2} />
          <Text fontWeight="bold" color={palette.text} mb={-2}>Rol</Text>
          {/* Aquí podrías cargar los roles desde una API, por ahora ejemplo simple */}
          <Select
            selectedValue={form.job_position_id}
            onValueChange={v => {
              const selected = jobPositions.find(j => String(j.id) === String(v));
              handleChange('job_position_id', v);
              handleChange('job_position_name', selected ? selected.name : '');
            }}
            accessibilityLabel="Selecciona rol"
            mb={2}
          >
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Rol" value={form.job_position_name} />
              <SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent style={{ paddingBottom: 48 }}>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                {jobPositions.map(j => (
                  <SelectItem key={j.id} label={j.name} value={String(j.id)} />
                ))}
              </SelectContent>
            </SelectPortal>
          </Select>
        <Divider my={2} />
          <Text fontWeight="bold" color={palette.text} mb={-2}>Perfil</Text>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Cédula</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.identity_card} placeholder="Cédula" onChangeText={v => handleChange('identity_card', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Nombre(s)</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.first_name} placeholder="Nombre(s)" onChangeText={v => handleChange('first_name', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Apellido(s)</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.last_name} placeholder="Apellido(s)" onChangeText={v => handleChange('last_name', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Género</Text>
          <Select
            selectedValue={form.gender}
            onValueChange={v => handleChange('gender', v)}
            accessibilityLabel="Selecciona género"
            mb={2}
          >
            <SelectTrigger variant="outline" size="md">
              <SelectInput placeholder="Género" value={(() => {
                if (form.gender === 'M') return 'Masculino';
                if (form.gender === 'F') return 'Femenino';
                if (form.gender === 'O') return 'Otro';
                return '';
              })()} />
              <SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
            </SelectTrigger>
            <SelectPortal>
              <SelectBackdrop />
              <SelectContent style={{ paddingBottom: 48 }}>
                <SelectDragIndicatorWrapper>
                  <SelectDragIndicator />
                </SelectDragIndicatorWrapper>
                <SelectItem label="Masculino" value="M" />
                <SelectItem label="Femenino" value="F" />
              </SelectContent>
            </SelectPortal>
          </Select>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Teléfono</Text>
          <HStack space="sm" alignItems="center" mb={2}>
            <Box style={{ minWidth: 100 }}>
              <Select
                selectedValue={form.prefix}
                onValueChange={v => setForm(prev => ({ ...prev, prefix: v }))}
                accessibilityLabel="Selecciona prefijo"
              >
                <SelectTrigger variant="outline" size="md">
                  <SelectInput placeholder="Prefijo" value={(() => {
                    const found = prefixes.find(p => String(p.id) === String(form.prefix));
                    if (found) return found.code ? `0${found.code}` : found.id;
                    if (form.prefix) return String(form.prefix);
                    return '';
                  })()} />
                  <SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent style={{ paddingBottom: 48 }}>
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
            <Input variant="outline" flex={1}>
              <InputField value={form.contact_phone} placeholder="Teléfono" onChangeText={v => handleChange('contact_phone', v)} />
            </Input>
          </HStack>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Dirección</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.address} placeholder="Dirección" onChangeText={v => handleChange('address', v)} />
          </Input>
          <Divider />
      </VStack>
      <HStack space="md" justifyContent="center" marginTop={48}>
        <Button width="100%" size="lg" variant="solid" backgroundColor={palette.primary} onPress={async () => {
          const accessToken = authUser?.access;
          const payload = {};
          // Campos simples
          if (form.username !== user.username) payload.username = form.username;
          if (form.first_name !== user.first_name) payload.first_name = form.first_name;
          if (form.last_name !== user.last_name) payload.last_name = form.last_name;
          if (form.email !== user.email) payload.email = form.email;
          if (form.is_active !== user.is_active) payload.is_active = form.is_active;
          if (form.is_staff !== user.is_staff) payload.is_staff = form.is_staff;
          if (form.is_superuser !== user.is_superuser) payload.is_superuser = form.is_superuser;
          if ((form.job_position_id || '') !== (user.job_position?.id || '')) payload.job_position = form.job_position_id;

          // Campos anidados de profile
          const profilePayload = {};
          if (form.identity_card !== (user.profile?.identity_card || '')) profilePayload.identity_card = form.identity_card;
          if (form.last_name !== (user.profile?.last_name || '')) profilePayload.last_name = form.last_name;
          if (form.gender !== (user.profile?.gender || '')) profilePayload.gender = form.gender;
          if (form.prefix !== (user.profile?.prefix || '')) profilePayload.prefix = form.prefix;
          if (form.contact_phone !== (user.profile?.contact_phone || '')) profilePayload.contact_phone = form.contact_phone;
          if (form.address !== (user.profile?.address || '')) profilePayload.address = form.address;
          if (Object.keys(profilePayload).length > 0) payload.profile = profilePayload;

          // Mostrar el payload enviado
          console.log('PATCH payload:', payload);

          if (Object.keys(payload).length === 0) {
            Toast.show({ type: 'info', text1: 'Sin cambios', position: 'top', visibilityTime: 2000 });
            return;
          }
          try {
            await patchUser(user.id, payload, accessToken);
            Toast.show({ type: 'success', text1: 'Usuario actualizado', position: 'top', visibilityTime: 2200 });
            navigation.goBack();
          } catch (e) {
            Toast.show({ type: 'error', text1: 'Error al actualizar', text2: 'No se pudo actualizar el usuario.', position: 'top', visibilityTime: 3000 });
          }
        }} style={{ marginBottom: 24 }}>
          <Text color={palette.background} fontWeight="bold">Guardar cambios</Text>
        </Button>
      </HStack>
        
  </ScrollView>
  <Box style={{ height: 48 }} />
  </Box>
);
}
