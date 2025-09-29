import React, { useContext } from 'react';
// import HistorialVentasScreen from './HistorialVentasScreen';
import { SafeAreaView, Platform } from 'react-native';
import { Box, Text, VStack, HStack } from '@gluestack-ui/themed';
import { CustomButton } from '../components/CustomButton';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import CustomTabBar from '../components/CustomTabBar';
import AppHeader from '../components/AppHeader';
import TabHeader from '../components/TabHeader';
// import StartSaleScreen from './StartSaleScreen';

// Pantallas básicas para cada pestaña
// HistorialVentasScreen ahora es importado


function IniciarCompraScreen({ navigation }) {
  React.useEffect(() => {
    navigation.replace('IdentificarCliente');
  }, [navigation]);
  return null;
}

function HistorialOperacionesRedirect({ navigation }) {
  React.useEffect(() => {
    navigation.replace('HistorialVentas');
  }, [navigation]);
  return null;
}

function OtrosProductosScreen() {
  return (
    <Box flex={1} bg="transparent">
      {/* <AppHeader />  <-- Elimina este header aquí */}
      <Box flex={1} alignItems="center" justifyContent="center">
        <Text fontSize={22} fontWeight="bold">Otros Productos</Text>
      </Box>
    </Box>
  );
}

// Dashboard como pantalla/tab
import PendientesEntregaCard from '../components/PendientesEntregaCard';
import { ScrollView, RefreshControl } from 'react-native';
function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const [refreshing, setRefreshing] = React.useState(false);
  const pendientesRef = React.useRef();

  // Función para refrescar la card
  const onRefresh = async () => {
    setRefreshing(true);
    if (pendientesRef.current && pendientesRef.current.refetch) {
      await pendientesRef.current.refetch();
    }
    setRefreshing(false);
  };

  return (
    <>
      <AppHeader />
      <Box flex={1} bg="transparent" borderWidth={0}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <PendientesEntregaCard ref={pendientesRef} />
        </ScrollView>
      </Box>
    </>
  );
}

const Tab = createBottomTabNavigator();
// CustomTabBar ha sido extraído a un archivo aparte para mejor organización y reutilización.

export default function CajeroDashboardTabs() {
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
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
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Inicio', title: 'Inicio' }}
      />
      <Tab.Screen
        name="IniciarCompra"
        component={IniciarCompraScreen}
        options={{
          tabBarLabel: 'Iniciar Compra',
          title: 'Iniciar Compra',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="HistorialOperaciones"
        component={HistorialOperacionesRedirect}
        options={{
          tabBarLabel: 'Historial de Operaciones',
          title: 'Historial de Operaciones',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

