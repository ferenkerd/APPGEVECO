import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/AppHeader';
import TabHeader from '../components/TabHeader';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { Box, Text, Button } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

// Pantalla de inicio del almacenista, con identidad visual y botón destacado
function AlmacenInicioScreen() {
  const navigation = useNavigation();
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  return (
    <>
      <AppHeader />
      <Box flex={1} bg={palette.background} alignItems="center" justifyContent="center" px={4}>
        <Box
          width="100%"
          maxWidth={400}
          alignSelf="center"
          flexDirection="column"
          display="flex"
          gap={24}
        >
          <Text fontSize={24} fontWeight="bold" mb={2} color={palette.text} textAlign="center">
            Bienvenido, Almacenista
          </Text>
          <Button
            size="lg"
            bg={palette.primary}
            onPress={() => navigation.navigate('RegistrarProducto')}
            width="100%"
          >
            <Text color="#fff" fontWeight="bold">Registrar producto</Text>
          </Button>
        </Box>
      </Box>
    </>
  );
}

// Inventario con identidad visual
function AlmacenInventarioScreen() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  return (
    <Box flex={1} bg={palette.background} alignItems="center" justifyContent="center" px={4}>
      <Text fontSize={22} fontWeight="bold" color={palette.text}>Inventario</Text>
      {/* Aquí puedes agregar la lista de inventario o componentes reciclados */}
    </Box>
  );
}

// Reportes con identidad visual
function AlmacenReportesScreen() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  return (
    <Box flex={1} bg={palette.background} alignItems="center" justifyContent="center" px={4}>
      <Text fontSize={22} fontWeight="bold" color={palette.text}>Reportes</Text>
      {/* Aquí puedes agregar componentes de reportes reciclados */}
    </Box>
  );
}

const Tab = createBottomTabNavigator();

export default function AlmacenistaDashboardTabs() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  return (
    <Tab.Navigator
      initialRouteName="AlmacenInicio"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTitleStyle: { color: palette.text },
        headerTintColor: palette.primary,
        tabBarShowLabel: false,
        headerTitleAlign: 'center',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AlmacenInicio"
        component={AlmacenInicioScreen}
        options={{ tabBarLabel: 'Inicio', title: 'Inicio' }}
      />
      <Tab.Screen
        name="AlmacenInventario"
        component={AlmacenInventarioScreen}
        options={{
          tabBarLabel: 'Inventario',
          title: 'Inventario',
          headerShown: true,
            header: () => <TabHeader title="Inventario" showMenu={false} />,
        }}
      />
      <Tab.Screen
        name="AlmacenReportes"
        component={AlmacenReportesScreen}
        options={{
          tabBarLabel: 'Reportes',
          title: 'Reportes',
          headerShown: true,
          header: () => <TabHeader title="Reportes" />,
        }}
      />
    </Tab.Navigator>
  );
}
