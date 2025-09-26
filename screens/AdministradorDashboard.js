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
    <>
      <AppHeader />
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text fontSize={22} fontWeight="bold">Administrador Dashboard</Text>
      </Box>
    </>
  );
}



import OrdenesPendientesScreen from './OrdenesPendientesScreen';


import AdminOtrosScreen from './AdminOtrosScreen';

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
  <Tab.Screen name="AdminOrdenesPendientes" component={OrdenesPendientesScreen} options={{ tabBarLabel: 'Órdenes pendientes', title: 'Órdenes pendientes' }} />
  <Tab.Screen name="AdminOtros" component={AdminOtrosScreen} options={{ tabBarLabel: 'Otros', title: 'Otros' }} />
    </Tab.Navigator>
  );
}
