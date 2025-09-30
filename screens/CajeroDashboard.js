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
import { ScrollView, RefreshControl, Dimensions, ActivityIndicator } from 'react-native';
import { getUsdtBinance, getUsdBcv, listSalesByCajero, listSales } from '../services/api';
function CardVentasCajeroTotal() {
  const { user } = useAuth();
  const [ventas, setVentas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const width = Dimensions.get('window').width;

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listSalesByCajero(user.id);
        // Todas las ventas completadas del cajero (histórico)
        const ventasCompletadas = Array.isArray(data)
          ? data.filter(v => (v.status || '').toLowerCase() === 'paid')
          : [];
        setVentas(ventasCompletadas);
      } catch {
        setVentas([]);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <Box
      width={width * 0.48}
      minHeight={100}
      borderWidth={1}
      borderColor="#eee"
      borderRadius={12}
      p={12}
      alignItems="center"
      justifyContent="center"
      bg="#f8fafc"
      mr={2}
    >
      <Text fontWeight="bold" fontSize={16} mb={2}>Ventas completadas (histórico)</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Text fontSize={28} color="#007bff">{ventas.length}</Text>
      )}
    </Box>
  );
}

function CardVentasCajeroHoy() {
  const { user } = useAuth();
  const [ventas, setVentas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const width = Dimensions.get('window').width;
  const hoy = new Date().toISOString().slice(0, 10);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listSalesByCajero(user.id);
        // Solo ventas completadas de hoy
        const ventasHoy = Array.isArray(data)
          ? data.filter(v => {
              const status = (v.status || '').toLowerCase();
              // sale_date puede ser el campo de fecha
              const fecha = v.fecha || v.sale_date || '';
              return fecha.startsWith(hoy) && status === 'paid';
            })
          : [];
        setVentas(ventasHoy);
      } catch {
        setVentas([]);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <Box
      width={width * 0.48}
      minHeight={100}
      borderWidth={1}
      borderColor="#eee"
      borderRadius={12}
      p={12}
      alignItems="center"
      justifyContent="center"
      bg="#f8fafc"
      mr={2}
    >
      <Text fontWeight="bold" fontSize={16} mb={2}>Ventas completadas hoy</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Text fontSize={28} color="#007bff">{ventas.length}</Text>
      )}
    </Box>
  );
}

function CardTotales() {
  const [ventas, setVentas] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const width = Dimensions.get('window').width;
  const hoy = new Date().toISOString().slice(0, 10);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await listSales();
        // Filtrar ventas del día y completadas
        const ventasHoy = Array.isArray(data)
          ? data.filter(v => v.fecha && v.fecha.startsWith(hoy) && (v.estado === 'completada' || v.status === 'completada'))
          : [];
        setVentas(ventasHoy);
      } catch {
        setVentas([]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <Box
      width={width * 0.48}
      minHeight={100}
      borderWidth={1}
      borderColor="#eee"
      borderRadius={12}
      p={12}
      alignItems="center"
      justifyContent="center"
      bg="#f8fafc"
      mr={2}
    >
      <Text fontWeight="bold" fontSize={16} mb={2}>Ventas completadas hoy (total)</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Text fontSize={28} color="#007bff">{ventas.length}</Text>
      )}
    </Box>
  );
}
function UsdBcvCard() {
  const [valor, setValor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const width = Dimensions.get('window').width;

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getUsdBcv();
      console.log('[getUsdBcv]', data);
      setValor(data && data.usd_bcv ? data.usd_bcv : null);
      setLoading(false);
    })();
  }, []);

  return (
    <Box
      width={width * 0.48}
      minHeight={100}
      borderWidth={1}
      borderColor="#eee"
      borderRadius={12}
      p={12}
      alignItems="center"
      justifyContent="center"
      bg="#f8fafc"
      mr={2}
    >
      <Text fontWeight="bold" fontSize={16} mb={2}>USD BCV</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Text fontSize={22} color="#007bff">
          {valor ? `${parseFloat(valor).toFixed(2)} Bs` : 'No disponible'}
        </Text>
      )}
    </Box>
  );
}

console.log('getUsdtBinance function:', getUsdtBinance);

function UsdtBinanceCard() {
  const [valor, setValor] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const width = Dimensions.get('window').width;

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await getUsdtBinance();
      console.log('[getUsdtBinance]', data);
      setValor(data.usdt_binance);
      setLoading(false);
    })();
  }, []);

  return (
    <Box
      width={width * 0.48}
      minHeight={100}
      borderWidth={1}
      borderColor="#eee"
      borderRadius={12}
      p={12}
      alignItems="center"
      justifyContent="center"
      bg="#f8fafc"
      mr={2}
    >
      <Text fontWeight="bold" fontSize={16} mb={2}>USDT Binance</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#007bff" />
      ) : (
        <Text fontSize={22} color="#007bff">
          {valor ? `${valor} Bs` : 'No disponible'}
        </Text>
      )}
    </Box>
  );
}
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
                    <HStack space={2} px={2} mt={2}>
                      <UsdtBinanceCard />
                      <UsdBcvCard />
                    </HStack>
                    <HStack space={2} px={2} mt={2}>
                      <CardVentasCajeroTotal />
                      <CardVentasCajeroHoy />
                    </HStack>
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

