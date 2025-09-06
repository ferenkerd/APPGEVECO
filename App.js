import React, { useState, useContext } from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import Toast from 'react-native-toast-message';
import { CustomToast } from './components/CustomToast';
import { gluestackTheme } from './gluestack-theme';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CajeroDashboard from './screens/CajeroDashboard';
import AlmacenistaDashboard from './screens/AlmacenistaDashboard';
import AdministradorDashboard from './screens/AdministradorDashboard';
import StartScreen from './screens/StartScreen';
// import StartSaleScreen from './screens/StartSaleScreen';
import RegisterClientScreen from './screens/RegisterClientScreen';
import IdentificarClienteScreen from './screens/IdentificarClienteScreen';
import AgregarProductosScreen from './screens/AgregarProductosScreen';
import ProcesarPagoScreen from './screens/ProcesarPagoScreen';
import ResumenVentaScreen from './screens/ResumenVentaScreen';
import ToastTestScreen from './screens/ToastTestScreen';
import { ActivityIndicator, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';

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
  <Stack.Screen name="AgregarProductos" component={AgregarProductosScreen} options={{ title: 'Agregar Productos', headerShown: true }} />
  <Stack.Screen name="ProcesarPago" component={ProcesarPagoScreen} options={{ title: 'Procesar Pago', headerShown: true }} />
  <Stack.Screen name="ResumenVenta" component={ResumenVentaScreen} options={{ title: 'Resumen de Venta', headerShown: true }} />
  <Stack.Screen name="RegisterClient" component={RegisterClientScreen} options={{ title: 'Registrar Cliente', headerShown: true }} />
      <Stack.Screen name="AlmacenistaDashboard" component={AlmacenistaDashboard} options={{ headerShown: false }} />
      <Stack.Screen name="AdministradorDashboard" component={AdministradorDashboard} options={{ headerShown: false }} />
  <Stack.Screen name="ToastTest" component={ToastTestScreen} options={{ headerShown: false }} />
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
              <NavigationContainer>
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

