import React, { useContext, useState } from 'react';
import { TouchableOpacity, Image, Modal, View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Text } from '@gluestack-ui/themed';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { ColorModeContext } from '../context/ColorModeContext';
import { useAuth } from '../context/AuthContext';
import { getPalette } from '../styles/theme';

export default function AppHeader() {
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const { logout } = useAuth();
  const palette = getPalette(colorMode);
  const navigation = useNavigation();

  const [menuVisible, setMenuVisible] = useState(false);
  const nextMode = colorMode === 'dark' ? 'claro' : 'oscuro';

  return (
    <Box
      bg={palette.background}
      style={{
        width: '100%',
        height: 72,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
        elevation: 0,
        shadowColor: 'transparent',
        // marginTop: -12, // Eliminado para evitar problemas de posición
        paddingHorizontal: 16,
      }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" width="100%" style={{ height: '100%' }}>
        {/* Logo y nombre de la app a la izquierda */}
        <Box flexDirection="row" alignItems="center">
          <Image
            source={require('../assets/logo.png')}
            style={{ width: 40, height: 40, resizeMode: 'contain' }}
          />
          <Text fontSize={20} fontWeight="bold" color={palette.text}>
            APPGEVECO
          </Text>
  </Box>
        {/* Botón de menú a la derecha, abre un modal */}
        <>
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={{
              padding: 8,
              borderRadius: 20,
              backgroundColor: palette.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Abrir menú de usuario"
          >
            <Feather name="more-vertical" size={24} color={palette.text} />
          </TouchableOpacity>
          <Modal
            visible={menuVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMenuVisible(false)}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
              <View style={{ position: 'absolute', top: 60, right: 16, backgroundColor: palette.background, borderRadius: 12, padding: 8, elevation: 8, minWidth: 180, borderWidth: 1, borderColor: palette.border }}>
                <TouchableOpacity
                  onPress={() => {
                    setMenuVisible(false);
                    toggleColorMode();
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
                >
                  <Feather name={colorMode === 'dark' ? 'sun' : 'moon'} size={18} color={palette.text} style={{ marginRight: 8 }} />
                  <Text color={palette.text}>Cambiar a modo {colorMode === 'dark' ? 'claro' : 'oscuro'}</Text>
                </TouchableOpacity>
                <View style={{ height: 1, backgroundColor: palette.border, marginVertical: 4 }} />
                <TouchableOpacity
                  onPress={async () => {
                    setMenuVisible(false);
                    await logout();
                    navigation.navigate('Login');
                  }}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 10 }}
                >
                  <MaterialIcons name="logout" size={18} color={palette.text} style={{ marginRight: 8 }} />
                  <Text color={palette.text}>Cerrar sesión</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Modal>
        </>
  </Box>
    </Box>
  );
}
