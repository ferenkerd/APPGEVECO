import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/AppHeader';
import TabHeader from '../components/TabHeader';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { Box, Text } from '@gluestack-ui/themed';

function AdminInicioScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={22} fontWeight="bold">Administrador Dashboard</Text>
    </Box>
  );
}

function AdminUsuariosScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={22} fontWeight="bold">Gestión de Usuarios</Text>
    </Box>
  );
}

function AdminReportesScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={22} fontWeight="bold">Reportes</Text>
    </Box>
  );
}

const Tab = createBottomTabNavigator();

export default function AdministradorDashboardTabs() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  return (
    <Tab.Navigator
      initialRouteName="AdminInicio"
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
      <Tab.Screen name="AdminInicio" component={AdminInicioScreen} options={{ tabBarLabel: 'Inicio', title: 'Inicio' }} />
      <Tab.Screen name="AdminUsuarios" component={AdminUsuariosScreen} options={{ tabBarLabel: 'Usuarios', title: 'Usuarios', headerShown: true, header: () => <TabHeader title="Usuarios" /> }} />
      <Tab.Screen name="AdminReportes" component={AdminReportesScreen} options={{ tabBarLabel: 'Reportes', title: 'Reportes', headerShown: true, header: () => <TabHeader title="Reportes" /> }} />
    </Tab.Navigator>
  );
}
