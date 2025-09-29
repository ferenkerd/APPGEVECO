
import React, { useContext, useState } from 'react';
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
import { getPrefixes } from '../services/api';
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
    first_name: user.profile?.first_name || '',
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
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <Text fontSize={24} fontWeight="bold" mb={2} mt={4} textAlign="center" color={palette.text}>
        Gestión de usuario
      </Text>
      <Divider mb={2} />
      <VStack space="md" mt={4}>
          <Text fontWeight="bold" color={palette.text} mb={-2}>ID</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={String(user.id || user.user_id || '-')} placeholder="ID" editable={false} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Usuario</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={form.username} placeholder="Usuario" editable={false} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Email</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.email} placeholder="Email" onChangeText={v => handleChange('email', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Fecha de registro</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={formatDate(form.date_joined)} placeholder="Fecha de registro" editable={false} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Último acceso</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={formatDate(form.last_login)} placeholder="Último acceso" editable={false} />
          </Input>
        <HStack space="md" alignItems="center">
          <Text color={palette.text}>Activo:</Text>
          <Button size="sm" variant={form.is_active ? 'solid' : 'outline'} backgroundColor={palette.primary} onPress={() => handleChange('is_active', !form.is_active)}>
            <Text color={form.is_active ? palette.background : palette.primary}>{form.is_active ? 'Sí' : 'No'}</Text>
          </Button>
        </HStack>
        <Divider my={2} />
          <Text fontWeight="bold" color={palette.text} mb={-2}>Rol</Text>
          <Text fontWeight="bold" color={palette.text} mb={-2}>ID de rol</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={String(form.job_position_id)} placeholder="ID de rol" editable={false} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Nombre de rol</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.job_position_name} placeholder="Nombre de rol" onChangeText={v => handleChange('job_position_name', v)} />
          </Input>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Descripción de rol</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.job_position_description} placeholder="Descripción de rol" onChangeText={v => handleChange('job_position_description', v)} />
          </Input>
        <Divider my={2} />
          <Text fontWeight="bold" color={palette.text} mb={-2}>Perfil</Text>
          <Text fontWeight="bold" color={palette.text} mb={-2}>ID de perfil</Text>
          <Input variant="outline" mb={2} isDisabled>
            <InputField value={String(form.profile_id)} placeholder="ID de perfil" editable={false} />
          </Input>
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
          <Input variant="outline" mb={2}>
            <InputField value={form.gender} placeholder="Género" onChangeText={v => handleChange('gender', v)} />
          </Input>
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
            <Input variant="outline" flex={1}>
              <InputField value={form.contact_phone} placeholder="Teléfono" onChangeText={v => handleChange('contact_phone', v)} />
            </Input>
          </HStack>
          <Text fontWeight="bold" color={palette.text} mb={-2}>Dirección</Text>
          <Input variant="outline" mb={2}>
            <InputField value={form.address} placeholder="Dirección" onChangeText={v => handleChange('address', v)} />
          </Input>
      </VStack>
      <Divider my={4} />
      <HStack space="md" justifyContent="center">
        <Button size="lg" variant="solid" backgroundColor={palette.primary} onPress={() => {/* TODO: guardar cambios */}}>
          <Text color={palette.background} fontWeight="bold">Guardar cambios</Text>
        </Button>
        <Button size="lg" variant="outline" borderColor="#f00" onPress={() => {/* TODO: eliminar */}}>
          <Text color="#f00" fontWeight="bold">Eliminar</Text>
        </Button>
        </HStack>
      </ScrollView>
    </Box>
  );
}
