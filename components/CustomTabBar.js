
import React, { useContext } from 'react';
import { Box, Text } from '@gluestack-ui/themed';
import { TouchableOpacity, View, SafeAreaView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';


export default function CustomTabBar({ state, descriptors, navigation }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  return (
    <SafeAreaView
      style={{
        backgroundColor: palette.background,
        paddingBottom: Platform.OS === 'ios' ? 16 : 38,

        // Elimina paddingBottom para que SafeAreaView gestione el espacio seguro
      }}
      edges={Platform.OS === 'ios' ? ['bottom'] : undefined}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        bg={palette.background}
        style={{
          height: 70,
          borderTopWidth: 0,
          // shadowColor: '#000',
          // shadowOpacity: 0.08,
          // shadowRadius: 8,
          // elevation: 8,
          paddingHorizontal: 16,
        }}
      >
        {state.routes.map((route, index) => {
          if (!['Dashboard', 'IniciarCompra', 'HistorialVentas'].includes(route.name)) return null;
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;
          const isFocused = state.index === index;
          if (route.name === 'IniciarCompra') {
            return (
              <View key={route.key} style={{ flex: 1, alignItems: 'center', top: -24 }}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  onPress={() => navigation.navigate(route.name)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: palette.primary,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.18,
                    shadowRadius: 8,
                    elevation: 8,
                    borderWidth: 4,
                    borderColor: palette.background,
                  }}
                  activeOpacity={0.85}
                >
                  <MaterialIcons name="add-shopping-cart" size={32} color="#fff" />
                </TouchableOpacity>
                <Text
                  fontSize={12}
                  color={palette.text}
                  mt={2}
                  style={{ fontWeight: isFocused ? 'bold' : 'normal' }}
                >
                  Iniciar Compra
                </Text>
              </View>
            );
          }
          let iconName = 'home';
          if (route.name === 'HistorialVentas') iconName = 'history';
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={() => navigation.navigate(route.name)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 8,
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons
                name={iconName}
                size={28}
                color={isFocused ? palette.primary : palette.textSecondary}
              />
              <Text
                fontSize={12}
                color={isFocused ? palette.primary : palette.textSecondary}
                mt={1}
                style={{ fontWeight: isFocused ? 'bold' : 'normal' }}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Box>
    </SafeAreaView>
  );
}
