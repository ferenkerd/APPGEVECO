import React, { useContext } from 'react';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import { ScrollView } from 'react-native';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';

const modules = [
  {
    key: 'usuarios',
    title: 'Usuarios',
    description: 'Gestiona los usuarios del sistema',
    button: 'Ver usuarios',
    icon: 'person',
  },
  {
    key: 'reportes',
    title: 'Reportes',
    description: 'Visualiza reportes y estadísticas de ventas y operaciones',
    button: 'Ver reportes',
    icon: 'bar-chart',
  },
  {
    key: 'productos',
    title: 'Productos',
    description: 'Administra el catálogo de productos',
    button: 'Ver productos',
    icon: 'inventory',
  },
  {
    key: 'divisas',
    title: 'Divisas y moneda base',
    description: 'Administra los valores de referencia de las diferentes divisas y selecciona en qué moneda se reflejan los montos.',
    button: 'Configurar divisas',
    icon: '💱',
  },
  {
    key: 'tipo-cobro',
    title: 'Tipo de cobro',
    description: 'Define si el cobro es centralizado (solo admin puede cobrar) o descentralizado (el cajero puede cobrar).',
    button: 'Cambiar tipo de cobro',
    icon: '🏦',
  },
  {
    key: 'configuracion',
    title: 'Configuración',
    description: 'Ajusta la configuración de la aplicación',
    button: 'Ir a configuración',
    icon: 'settings',
  },
];

import TabHeader from '../components/TabHeader';

export default function AdminOtrosScreen({ navigation }) {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  // Handler para los botones de cada módulo
  const handleModulePress = (mod) => {
    if (mod.key === 'tipo-cobro') {
      navigation.navigate('TipoCobro');
    } else {
      // Aquí puedes agregar navegación para otros módulos si lo deseas
    }
  };

  return (
    <Box flex={1} bg={palette.surface}>
  <TabHeader title="Otros módulos" showMenu={false} hideMenu />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 32, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
        <Text fontSize={20} mb={2} color={palette.text}>Otros módulos</Text>
        <Text color={palette.textSecondary} mb={4}>Accede aquí a los módulos administrativos</Text>
        <VStack space="md" width="100%" alignItems="center">
          {modules.map((mod) => (
            <Box
              key={mod.key}
              bg={palette.card || '#fff'}
              borderRadius={16}
              shadow={1}
              p={16}
              mb={12}
              width="92%"
              borderWidth={1}
              borderColor={palette.border}
            >
              <Box flexDirection="row" alignItems="center">
                <Box
                  mr={12}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: palette.surface,
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: '#000',
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                  }}
                >
                  {/* Icon placeholder, replace with real icon if needed */}
                  <Text fontSize={24} color={palette.primary}>{mod.icon === 'person' ? '👤' : mod.icon === 'bar-chart' ? '📊' : mod.icon === 'inventory' ? '📦' : mod.icon === 'settings' ? '⚙️' : mod.icon === '�' ? '💱' : mod.icon === '🏦' ? '🏦' : '�🔗'}</Text>
                </Box>
                <Box flex={1}>
                  <Text fontSize={16} fontWeight="bold" color={palette.text}>{mod.title}</Text>
                  <Text fontSize={13} color={palette.textSecondary} mt={1}>{mod.description}</Text>
                </Box>
              </Box>
              <CustomButton
                onPress={() => handleModulePress(mod)}
                backgroundColor={palette.primary}
                textColor={palette.background}
                style={{ marginTop: 14, width: '100%' }}
              >
                {mod.button}
              </CustomButton>
            </Box>
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}
