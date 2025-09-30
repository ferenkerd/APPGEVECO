import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@gluestack-ui/themed';
import { Box, Text, VStack, HStack, Button, Spinner, Divider, Input, InputField } from '@gluestack-ui/themed';
import { ScrollView, RefreshControl } from 'react-native';
import { getPalette } from '../styles/theme';
import { ColorModeContext } from '../context/ColorModeContext';
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../services/api';
import { useNavigation } from '@react-navigation/native';


export default function UserListScreen() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user } = useAuth();
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const accessToken = user?.access;
      const data = await getUsers(accessToken);
      setUsers(Array.isArray(data) ? data : (data.results || []));
    } catch (e) {
      setError('No se pudieron cargar los usuarios.');
    }
    if (isRefresh) setRefreshing(false); else setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUsers();
    const unsubscribe = navigation.addListener('focus', fetchUsers);
    return unsubscribe;
  }, [navigation, fetchUsers]);

  return (
    <Box flex={1} bg={palette.surface}>
      {/* Botón para ir a la pantalla de registro de usuario */}
      <Box px={16} pt={16} pb={4}>
        <Button
          size="md"
          backgroundColor={palette.primary}
          borderRadius={12}
          onPress={() => navigation.navigate('RegisterUser')}
        >
          <Text color="#fff" fontWeight="bold">Registrar nuevo usuario</Text>
        </Button>
      </Box>
      {loading ? (
        <Spinner size="large" mt={24} />
      ) : error ? (
        <Text color="#f00" textAlign="center" mt={8}>{error}</Text>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchUsers(true)}
              colors={[palette.primary]}
            />
          }
        >
          <Text fontSize={20} fontWeight="600" mb={2} textAlign="left" color={palette.text} paddingBottom={12}>Usuarios del sistema</Text>
          <HStack alignItems="center" space="sm" mb={3}>
            <Box style={{ width: 120, minWidth: 90, maxWidth: 140, marginRight: 8 }}>
              <Select
                selectedValue={searchField}
                onValueChange={setSearchField}
                accessibilityLabel="Filtrar por"
                triggerProps={{ style: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', height: 40, justifyContent: 'center', alignItems: 'center', padding: 0 } }}
              >
                <SelectTrigger style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', height: 40, justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                  <SelectInput placeholder="Campo" value={(() => {
                    if (searchField === 'all') return 'Todos';
                    if (searchField === 'username') return 'Usuario';
                    if (searchField === 'first_name') return 'Nombre';
                    if (searchField === 'last_name') return 'Apellido';
                    if (searchField === 'identity_card') return 'Cédula';
                    return '';
                  })()} />
                  <SelectIcon as={require('@expo/vector-icons').MaterialIcons} name="arrow-drop-down" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: '100%', maxHeight: '80%', minHeight: '50%', paddingBottom: 24}}>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <Box style={{ width: '100%', maxWidth: '100%', paddingBottom: 24 }}>
                      <SelectItem label="Todos" value="all" />
                      <SelectItem label="Usuario" value="username" />
                      <SelectItem label="Nombre" value="first_name" />
                      <SelectItem label="Apellido" value="last_name" />
                      <SelectItem label="Cédula" value="identity_card" />
                    </Box>
                  </SelectContent>
                </SelectPortal>
              </Select>
            </Box>
            <Box style={{ flex: 1 }}>
              <Input bg="#f5f5f5" borderRadius={12} px={0} style={{ paddingRight: 36 }}>
                <InputField
                  placeholder={
                    searchField === 'all' ? 'Buscar...' :
                    searchField === 'username' ? 'Buscar por usuario...' :
                    searchField === 'first_name' ? 'Buscar por nombre...' :
                    searchField === 'last_name' ? 'Buscar por apellido...' :
                    searchField === 'identity_card' ? 'Buscar por cédula...' :
                    'Buscar...'
                  }
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{ paddingRight: 36 }}
                />
              </Input>
            </Box>
          </HStack>
          <VStack space="md">
            {users.filter(user => {
              const q = search.toLowerCase();
              if (!q) return true;
              const username = (user.username || '').toLowerCase();
              const firstName = (user.first_name || user.profile?.first_name || '').toLowerCase();
              const lastName = (user.profile?.last_name || '').toLowerCase();
              const identityCard = (user.profile?.identity_card || '').toLowerCase();
              if (searchField === 'all') {
                return (
                  username.includes(q) ||
                  firstName.includes(q) ||
                  lastName.includes(q) ||
                  identityCard.includes(q)
                );
              } else if (searchField === 'username') {
                return username.includes(q);
              } else if (searchField === 'first_name') {
                return firstName.includes(q);
              } else if (searchField === 'last_name') {
                return lastName.includes(q);
              } else if (searchField === 'identity_card') {
                return identityCard.includes(q);
              }
              return true;
            }).length === 0 ? (
              <Text color={palette.textSecondary} textAlign="center">No hay usuarios registrados.</Text>
            ) : (
              users.filter(user => {
                const q = search.toLowerCase();
                if (!q) return true;
                const username = (user.username || '').toLowerCase();
                const firstName = (user.first_name || user.profile?.first_name || '').toLowerCase();
                const lastName = (user.profile?.last_name || '').toLowerCase();
                const identityCard = (user.profile?.identity_card || '').toLowerCase();
                if (searchField === 'all') {
                  return (
                    username.includes(q) ||
                    firstName.includes(q) ||
                    lastName.includes(q) ||
                    identityCard.includes(q)
                  );
                } else if (searchField === 'username') {
                  return username.includes(q);
                } else if (searchField === 'first_name') {
                  return firstName.includes(q);
                } else if (searchField === 'last_name') {
                  return lastName.includes(q);
                } else if (searchField === 'identity_card') {
                  return identityCard.includes(q);
                }
                return true;
              }).map(user => (
                <Box key={user.id || user.username || user.email} bg={palette.card} borderRadius={12} p={16} mb={2} borderWidth={1} borderColor={palette.border} position="relative">
                  {/* Activo/No activado en la esquina superior derecha */}
                  <Box position="absolute" top={8} right={12} zIndex={1}>
                    <Text color={user.is_active ? '#2ecc40' : '#e74c3c'} fontWeight="600">
                      {user.is_active ? 'Activo' : 'No activado'}
                    </Text>
                  </Box>
                  <VStack space="none">
                    <Text fontWeight="bold" color={palette.text} style={{ marginBottom: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0 }}>
                      {user.username}
                    </Text>
                    <Text color={palette.textSecondary} style={{ marginBottom: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0 }}>
                      Cédula: {user.profile?.identity_card || ''}
                    </Text>
                    <Text color={palette.textSecondary} style={{ marginBottom: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0 }}>
                      Nombres: {user.first_name || user.profile?.first_name || ''}
                    </Text>
                    <Text color={palette.textSecondary} style={{ marginBottom: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0 }}>
                      Apellidos: {user.profile?.last_name || ''}
                    </Text>
                    <Text color={palette.textSecondary} style={{ marginBottom: 0, marginTop: 0, paddingBottom: 0, paddingTop: 0 }}>
                      Rol: {user.job_position?.name || ''}
                    </Text>
                  </VStack>
                  {/* Botón en la esquina inferior derecha */}
                  <Box position="absolute" bottom={8} right={12} zIndex={1}>
                    <Button size="sm" backgroundColor="#000" onPress={() => navigation.navigate('UserDetail', { user })}>
                      <Text color="#fff">Ver</Text>
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </VStack>
        </ScrollView>
      )}
        <Box style={{ height: 48 }} />
    </Box>
  );
}
