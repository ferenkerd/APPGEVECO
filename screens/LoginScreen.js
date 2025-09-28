import { loginStyles } from '../styles/loginStyles';
import { devLog } from '../utils/logger';
//
import React, { useState, useEffect, useContext } from 'react';
import Toast from 'react-native-toast-message';
import { ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { Box, Image } from '@gluestack-ui/themed';
import { Card } from '../components/Card';
import { VStack } from '@gluestack-ui/themed';
import { Heading } from '@gluestack-ui/themed';
import { Input, InputField, InputIcon, InputSlot } from '@gluestack-ui/themed';
import { Button, ButtonText } from '@gluestack-ui/themed'; // legacy, para otros botones
import { CustomButton } from '../components/CustomButton';
import { Loader } from '../components/Loader';
import { FormInput } from '../components/FormInput';
import { Text } from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from '@gluestack-ui/themed';

const LoginScreen = ({ navigation }) => {
  devLog('LoginScreen mounted');
  const { login, loading, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    devLog('LoginScreen useEffect', { user });
    if (user && user.user && user.user.job_position) {
      devLog('job_position value:', user.user.job_position);
      // Mapear los valores numéricos a los dashboards
      switch (user.user.job_position) {
        case 4:
          navigation.replace('CajeroDashboard');
          break;
        case 3:
          navigation.replace('AlmacenistaDashboard');
          break;
        case 2:
          navigation.replace('AdministradorDashboard');
          break;
        default:
          // navigation.replace('Home'); // O una pantalla de error/perfil no reconocido
          // Solucionado: No navegar a 'Home', puedes mostrar un error o dejarlo vacío
          break;
      }
    }
  }, [user, navigation]);

  const handleLogin = async () => {
    devLog('LoginScreen: login button pressed', { username });
    setSubmitting(true);
    const success = await login(username, password);
    devLog('LoginScreen: login result', { success });
    setSubmitting(false);
    if (success) {
      const toastData = {
        type: 'success',
        text1: '¡Bienvenido!',
        text2: 'Has iniciado sesión correctamente.',
        position: 'top',
        visibilityTime: 2200,
      };
      console.log('[TOAST]', toastData);
      Toast.show(toastData);
      setTimeout(() => {
        // navigation.replace('Home');
        // Solucionado: No navegar a 'Home', puedes dejarlo vacío o navegar a un dashboard válido si aplica
      }, 2000);
    } else {
      const toastData = {
        type: 'error',
        text1: 'Error',
        text2: 'Usuario o contraseña incorrectos',
        position: 'top',
        visibilityTime: 3000,
      };
      console.log('[TOAST]', toastData);
      Toast.show(toastData);
    }
  };

  if (loading) {
    return <Loader />;
  }

  const { ColorModeContext } = require('../context/ColorModeContext');
  const { getPalette } = require('../styles/theme');
  const { colorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Fondo bajo el status bar para edge-to-edge */}
          <Box style={{ height: 32, backgroundColor: palette.background, width: '100%' }} />
          <Box style={[loginStyles.container, { backgroundColor: palette.background, paddingBottom: 24 }]}> 
            <Card style={{
              ...loginStyles.card,
              backgroundColor: colorMode === 'dark' ? '#111' : '#fff',
            }}>
              <VStack space="xl" alignItems="center" justifyContent="center">
                <Image
                  source={colorMode === 'dark' ? require('../assets/logo-dark.png') : require('../assets/logo.png')}
                  style={loginStyles.logo}
                  resizeMode="contain"
                  alt="Logo Keylimar"
                />
                <Heading style={[loginStyles.heading, { color: colorMode === 'dark' ? '#fff' : '#111' }]}>Inicio de Sesión</Heading>
                <VStack space="xs" width="100%">
                  <Text style={{ color: colorMode === 'dark' ? '#fff' : palette.textSecondary }}>Usuario</Text>
                  <FormInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Usuario"
                    autoCapitalize="none"
                    editable={!submitting}
                    style={{ minWidth: 250 }}
                  />
                </VStack>
                <VStack space="xs" width="100%">
                  <Text style={{ color: colorMode === 'dark' ? '#fff' : palette.textSecondary }}>Contraseña</Text>
                  <FormInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Contraseña"
                    secureTextEntry={!showPassword}
                    editable={!submitting}
                    icon={showPassword ? EyeIcon : EyeOffIcon}
                    style={{ minWidth: 250 }}
                    // Opción para mostrar/ocultar contraseña
                    onIconPress={() => setShowPassword((v) => !v)}
                  />
                </VStack>
                <CustomButton
                  style={{ width: '100%', marginTop: 12 }}
                  backgroundColor={colorMode === 'dark' ? '#fff' : '#111'}
                  textColor={colorMode === 'dark' ? '#111' : '#fff'}
                  onPress={handleLogin}
                  disabled={submitting}
                >
                  {submitting ? 'Ingresando...' : 'Ingresar'}
                </CustomButton>
              </VStack>
            </Card>
          </Box>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
