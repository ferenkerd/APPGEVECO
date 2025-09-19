import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomTabBar from '../components/CustomTabBar';
import TabHeader from '../components/TabHeader';
import AgregarProductosScreen from './AgregarProductosScreen';
import { Box, Text } from '@gluestack-ui/themed';

function HistorialVentasScreen() {
  return (
    <Box flex={1} alignItems="center" justifyContent="center">
      <Text fontSize={22} fontWeight="bold">Historial de Operaciones</Text>
    </Box>
  );
}

function IniciarCompraScreen({ navigation }) {
  React.useEffect(() => {
    navigation.replace('IdentificarCliente');
  }, [navigation]);
  return null;
}

const Tab = createBottomTabNavigator();

export default function AgregarProductosTabs() {
  return (
    <Tab.Navigator
      initialRouteName="AgregarProductos"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="AgregarProductos"
        component={AgregarProductosScreen}
        options={{ tabBarLabel: 'Productos', title: 'Productos' }}
      />
      <Tab.Screen
        name="IniciarCompra"
        component={IniciarCompraScreen}
        options={{
          tabBarLabel: 'Iniciar Compra',
          title: 'Iniciar Compra',
          headerShown: true,
          header: () => <TabHeader title="Iniciar Compra" />,
        }}
      />
      <Tab.Screen
        name="HistorialVentas"
        component={HistorialVentasScreen}
        options={{
      tabBarLabel: 'Historial de Operaciones',
      title: 'Historial de Operaciones',
      headerShown: true,
      header: () => <TabHeader title="Historial de Operaciones" />,
        }}
      />
    </Tab.Navigator>
  );
}
