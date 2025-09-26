import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import AdministradorDashboard from '../screens/AdministradorDashboard';
import OrdenesPendientesScreen from '../screens/OrdenesPendientesScreen';
import AdminOtrosScreen from '../screens/AdminOtrosScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      tabBar={props => <CustomTabBar {...props} admin />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={AdministradorDashboard} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="OrdenesPendientes" component={OrdenesPendientesScreen} options={{ tabBarLabel: 'Órdenes pendientes' }} />
      <Tab.Screen name="AdminOtros" component={AdminOtrosScreen} options={{ tabBarLabel: 'Otros' }} />
    </Tab.Navigator>
  );
}
