
import React, { useContext, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Box, Text, Image, VStack, Pressable } from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { CustomButton } from '../components/CustomButton';
import { Feather } from '@expo/vector-icons';
import { startStyles } from '../styles/startStyles';
import { ColorModeContext } from '../context/ColorModeContext';
import { getPalette } from '../styles/theme';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { devLog } from '../utils/logger';

const StartScreen = ({ navigation }) => {
  devLog('StartScreen mounted');
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  const palette = getPalette(colorMode);
  const { user, loading } = useAuth();


  useEffect(() => {
    devLog('StartScreen user:', user);
    if (user && user.user) {
      devLog('StartScreen user.user:', user.user);
    }
    // Si hay sesión activa y job_position, redirige al dashboard correspondiente
    if (user && user.user && user.user.job_position && user.user.job_position.id) {
      const role = Number(user.user.job_position.id);
      devLog('StartScreen job_position:', role);
      let dashboard = null;
      if (role === 1 || role === 2) {
        dashboard = 'AdministradorDashboard';
      } else if (role === 3) {
        dashboard = 'AlmacenistaDashboard';
      } else if (role === 4) {
        dashboard = 'CajeroDashboard';
      }
      if (dashboard) {
        devLog('StartScreen redirigiendo a:', dashboard);
        navigation.reset({ index: 0, routes: [{ name: dashboard }] });
      }
    }
  }, [user, navigation]);

  // Si hay sesión activa, no mostrar StartScreen (redirige automáticamente)
  if (user && user.user && user.user.job_position) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ExpoStatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
    {/* Botón de modo en la esquina superior derecha */}
  <Box style={{ position: 'absolute', top: 40, right: 16, zIndex: 10 }}>
        <Pressable
          onPress={toggleColorMode}
          style={{ padding: 8, borderRadius: 20, backgroundColor: palette.surface, alignItems: 'center', justifyContent: 'center' }}
          accessibilityLabel="Cambiar modo oscuro/claro"
        >
          {colorMode === 'dark' ? (
            <Feather name="sun" color={palette.text} size={24} />
          ) : (
            <Feather name="moon" color={palette.text} size={24} />
          )}
        </Pressable>
      </Box>
  <Box style={[startStyles.container, { backgroundColor: palette.background, paddingHorizontal: 24, flex: 1, justifyContent: 'center', alignItems: 'center' }]}> 
        <Image
          source={colorMode === 'dark' ? require('../assets/logo-dark.png') : require('../assets/logo.png')}
          style={{ width: 130, height: 130, alignSelf: 'center' }}
          resizeMode="contain"
          alt="Logo Keylimar"
        />
  <Text style={[startStyles.title, { color: palette.text }]}>¡Bienvenido al sistema de gestión del Abasto Keylimar!</Text>
  <Text style={[startStyles.subtitle, { color: palette.textSecondary }]}>Tu herramienta para un control eficiente y ventas más rápidas.</Text>
        <VStack space="md" width="100%" alignItems="center">
          <CustomButton
            style={{ width: '100%' }}
            backgroundColor={colorMode === 'dark' ? '#fff' : '#111'}
            textColor={colorMode === 'dark' ? '#111' : '#fff'}
            onPress={() => {
              devLog('StartScreen: Comenzar button pressed');
              navigation.navigate('Login');
            }}
          >
            Comenzar
          </CustomButton>
        </VStack>
      </Box>

    </SafeAreaView>
  );
}

export default StartScreen;
