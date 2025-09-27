import 'react-native-gesture-handler';
import React, { useState, useContext } from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import Toast from 'react-native-toast-message';
import { CustomToast } from './components/CustomToast';
import { gluestackTheme } from './gluestack-theme';
import { NavigationContainer } from '@react-navigation/native';
import { createNavigationContainerRef } from '@react-navigation/native';
// Referencia global para navegación fuera de componentes
export const navigationRef = createNavigationContainerRef();
if (!global.navigationRef) global.navigationRef = navigationRef;
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CajeroDashboard from './screens/CajeroDashboard';
import AlmacenistaDashboard from './screens/AlmacenistaDashboard';
import RegistrarProductoScreen from './screens/RegistrarProductoScreen';
import AdministradorDashboard from './screens/AdministradorDashboard';
import StartScreen from './screens/StartScreen';
// import StartSaleScreen from './screens/StartSaleScreen';
import RegisterClientScreen from './screens/RegisterClientScreen';
import EditarClienteScreen from './screens/EditarClienteScreen';
import IdentificarClienteScreen from './screens/IdentificarClienteScreen';
import AgregarProductosScreen from './screens/AgregarProductosScreen';
import ProcesarPagoScreen from './screens/ProcesarPagoScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ResumenVentaScreen from './screens/ResumenVentaScreen';
import OrdenesPendientesEntregaScreen from './screens/OrdenesPendientesEntregaScreen';
import ConfirmacionOperacionScreen from './screens/ConfirmacionOperacionScreen';
import DetalleVentaScreen from './screens/DetalleVentaScreen';
import ToastTestScreen from './screens/ToastTestScreen';
import TipoCobroScreen from './screens/TipoCobroScreen';
import { ActivityIndicator, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

// import BarcodeScannerScreen from './screens/BarcodeScannerScreen';
import CameraBarcodeScreen from './screens/CameraBarcodeScreen';
import AdminCobroScreen from './screens/AdminCobroScreen';
const Stack = createStackNavigator();

import { getPalette } from './styles/theme';
import { ColorModeContext } from './context/ColorModeContext';

function AppNavigator() {
  const { user, loading } = useAuth();
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { color: palette.text },
      }}
    >
  <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
  <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
  <Stack.Screen name="Home" component={HomeScreen} />
  <Stack.Screen name="CajeroDashboard" component={CajeroDashboard} options={{ headerShown: false }} />
  {/* <Stack.Screen name="StartSale" component={StartSaleScreen} options={{ headerShown: false }} /> */}
  <Stack.Screen name="IdentificarCliente" component={IdentificarClienteScreen} options={{ title: 'Identificar Cliente', headerShown: true }} />
  {/* <Stack.Screen name="BarcodeScanner" component={BarcodeScannerScreen} options={{ title: 'Escáner de Código', headerShown: true }} /> */}
  <Stack.Screen name="CameraBarcode" component={CameraBarcodeScreen} options={{ title: 'Escáner de Código (Cámara)', headerShown: true }} />
  <Stack.Screen name="AgregarProductos" component={AgregarProductosScreen} options={{ headerShown: true, title: 'Agregar Productos' }} />
  <Stack.Screen name="ProcesarPago" component={ProcesarPagoScreen} options={{ title: 'Procesar Pago', headerShown: true }} />
  <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ title: 'Checkout', headerShown: true }} />
  <Stack.Screen name="ResumenVenta" component={ResumenVentaScreen} options={{ title: 'Resumen de Venta', headerShown: true }} />
  <Stack.Screen name="OrdenesPendientesEntrega" component={OrdenesPendientesEntregaScreen} options={{ title: 'Órdenes por entregar', headerShown: true }} />
  <Stack.Screen name="ConfirmacionOperacion" component={ConfirmacionOperacionScreen} options={{ title: 'Operación enviada', headerShown: false }} />
  <Stack.Screen name="RegisterClient" component={RegisterClientScreen} options={{ title: 'Registrar Cliente', headerShown: true }} />
  <Stack.Screen name="EditarCliente" component={EditarClienteScreen} options={{ title: 'Editar Cliente', headerShown: true }} />
  <Stack.Screen name="AlmacenistaDashboard" component={AlmacenistaDashboard} options={{ headerShown: false }} />
  <Stack.Screen name="RegistrarProducto" component={RegistrarProductoScreen} options={{ title: 'Registrar Producto', headerShown: true }} />
      <Stack.Screen name="AdministradorDashboard" component={AdministradorDashboard} options={{ headerShown: false }} />
  <Stack.Screen name="ToastTest" component={ToastTestScreen} options={{ headerShown: false }} />
      <Stack.Screen name="DetalleVenta" component={DetalleVentaScreen} options={{ title: 'Detalle de Venta', headerShown: true, presentation: 'card' }} />
      <Stack.Screen name="TipoCobro" component={TipoCobroScreen} options={{ title: 'Tipo de cobro', headerShown: false }} />
      <Stack.Screen name="AdminCobro" component={AdminCobroScreen} options={{ title: 'Administrar Cobro', headerShown: true }} />
      <Stack.Screen name="AdminCobroScreen" component={AdminCobroScreen} options={{ title: 'Cobro de Orden', headerShown: true }} />
    </Stack.Navigator>
  );
}



export default function App() {
  const [colorMode, setColorMode] = useState('light');
  const toggleColorMode = () => setColorMode((m) => (m === 'light' ? 'dark' : 'light'));
  const palette = getPalette(colorMode);

  // Configura el color de la barra de navegación inferior en Android
  React.useEffect(() => {
    if (NavigationBar && NavigationBar.setButtonStyleAsync) {
      NavigationBar.setButtonStyleAsync(colorMode === 'dark' ? 'light' : 'dark');
    }
  }, [colorMode]);

  return (
    <ColorModeContext.Provider value={{ colorMode, toggleColorMode }}>
      <GluestackUIProvider config={gluestackTheme} colorMode={colorMode}>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: palette.background }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
              <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} translucent />
              {/* View para cubrir el área bajo el StatusBar en edge-to-edge */}
              <View style={{ height: 32, backgroundColor: palette.background, width: '100%' }} />
              <NavigationContainer ref={navigationRef}>
                <AppNavigator />
              </NavigationContainer>
            </SafeAreaView>
            <Toast
              config={{
                success: (props) => <CustomToast {...props} type="success" />, 
                error: (props) => <CustomToast {...props} type="error" />, 
                info: (props) => <CustomToast {...props} type="info" />, 
                warning: (props) => <CustomToast {...props} type="warning" />, 
              }}
              style={{ zIndex: 9999, elevation: 9999, position: 'absolute', pointerEvents: 'box-none' }}
            />
          </View>
        </AuthProvider>
      </GluestackUIProvider>
    </ColorModeContext.Provider>
  );
}

