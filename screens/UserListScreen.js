import React, { useEffect, useState, useContext } from 'react';
import { Box, Text, VStack, HStack, Button, Spinner, Divider } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = user?.access;
        const data = await getUsers(accessToken);
        setUsers(Array.isArray(data) ? data : (data.results || []));
      } catch (e) {
        setError('No se pudieron cargar los usuarios.');
      }
      setLoading(false);
    };
    fetchUsers();
  }, [user]);

  return (
    <Box flex={1} bg={palette.surface}>
      <Text fontSize={22} fontWeight="bold" mb={4} mt={4} textAlign="center" color={palette.text}>Usuarios del sistema</Text>
      <Divider mb={2} />
      {loading ? (
        <Spinner size="large" mt={24} />
      ) : error ? (
        <Text color="#f00" textAlign="center" mt={8}>{error}</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <VStack space="md">
            {users.length === 0 ? (
              <Text color={palette.textSecondary} textAlign="center">No hay usuarios registrados.</Text>
            ) : (
              users.map(user => (
                <Box key={user.id || user.username || user.email} bg={palette.card} borderRadius={12} p={16} mb={2} borderWidth={1} borderColor={palette.border}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <VStack>
                      <Text fontWeight="bold" color={palette.text}>
                        {user.username} {user.first_name ? `- ${user.first_name}` : ''}
                      </Text>
                      <Text color={palette.textSecondary}>
                        {user.profile?.last_name ? user.profile.last_name : ''}
                        {user.profile?.last_name && user.profile?.identity_card ? ' | ' : ''}
                        {user.profile?.identity_card ? `C.I.: ${user.profile.identity_card}` : ''}
                      </Text>
                      <Text color={palette.textSecondary}>{user.email}</Text>
                      <Text color={palette.primary} fontSize={13}>{user.role_name || user.role || ''}</Text>
                    </VStack>
                    <HStack space="sm">
                      <Button size="sm" variant="outline" borderColor={palette.primary} onPress={() => navigation.navigate('UserDetail', { user })}>
                        <Text color={palette.primary}>Ver</Text>
                      </Button>
                      <Button size="sm" variant="outline" borderColor={palette.primary}><Text color={palette.primary}>Editar</Text></Button>
                      <Button size="sm" variant="outline" borderColor="#f00"><Text color="#f00">Eliminar</Text></Button>
                    </HStack>
                  </HStack>
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
