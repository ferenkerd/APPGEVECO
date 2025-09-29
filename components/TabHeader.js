import React, { useContext, useState } from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import { TouchableOpacity, Modal, View, Pressable } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ColorModeContext } from '../context/ColorModeContext';
import { useAuth } from '../context/AuthContext';
import { getPalette } from '../styles/theme';

export default function TabHeader({ title, hideMenu, showMenu }) {
  const navigation = useNavigation();
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const { logout } = useAuth();
  const palette = getPalette(colorMode);
  const [menuVisible, setMenuVisible] = useState(false);

  // El menú solo se muestra si showMenu es true y hideMenu no está activado
  const shouldShowMenu = showMenu && !hideMenu;

  return (
    <Box
      bg={palette.background}
      style={{
        width: '100%',
        height: 72,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: palette.border,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" width="100%" style={{ height: '100%' }}>
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ padding: 8, marginRight: 8 }}
            accessibilityLabel="Volver"
          >
            <MaterialIcons name="arrow-back" size={24} color={palette.text} />
          </TouchableOpacity>
          <Text fontSize={20} fontWeight="bold" color={palette.text}>
            {title}
          </Text>
        </Box>
        {/* Botón de menú a la derecha solo en dashboard/inicio de caja */}
        {shouldShowMenu && (
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
              transparent={true}
              animationType="fade"
              onRequestClose={() => setMenuVisible(false)}
            >
              <Pressable style={{ flex: 1 }} onPress={() => setMenuVisible(false)}>
                <View
                  style={{
                    position: 'absolute',
                    top: 72,
                    right: 16,
                    backgroundColor: palette.background,
                    borderRadius: 12,
                    padding: 8,
                    elevation: 8,
                    minWidth: 180,
                    borderWidth: 1,
                    borderColor: palette.border,
                  }}
                >
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
                      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
        )}
      </Box>
    </Box>
  );
}
