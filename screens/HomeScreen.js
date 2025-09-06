
import { homeStyles } from '../styles/homeStyles';
import { Card } from '../components/Card';
import { CustomButton } from '../components/CustomButton';
import { devLog } from '../utils/logger';
import { Feather } from '@expo/vector-icons';


import React, { useEffect } from 'react';
import { Box, Text, VStack } from '@gluestack-ui/themed';
import Toast from 'react-native-toast-message';
import { SafeAreaView } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Button, ButtonText } from '@gluestack-ui/themed';
import { useContext } from 'react';
import { ColorModeContext } from '../context/ColorModeContext';

import { useAuth } from '../context/AuthContext';


const HomeScreen = ({ navigation }) => {
  devLog('HomeScreen mounted');
  const { logout, user } = useAuth();
  const { colorMode, toggleColorMode } = useContext(ColorModeContext);
  let username = '';
  let jobPosition = '';
  if (user && user.user) {
    username = user.user.username;
    jobPosition = user.user.job_position;
  }


  useEffect(() => {
    devLog('HomeScreen useEffect', { user });
    if (!user) {
      navigation.replace('Login');
    }
  }, [user, navigation]);

  // Log cuando se cierra sesión
  const handleLogout = async () => {
    devLog('HomeScreen: logout button pressed');
    await logout();
    Toast.show({
      type: 'success',
      text1: 'Sesión cerrada',
      text2: 'Has cerrado sesión correctamente.',
      position: 'top',
      visibilityTime: 2200,
    });
  };

  const palette = require('../styles/theme').getPalette(colorMode);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.background }}>
      <ExpoStatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      {/* Fondo bajo el status bar para edge-to-edge */}
      <Box style={{ height: 32, backgroundColor: palette.background, width: '100%' }} />
      {/* Mode toggle button in top-left */}
      <Box style={{ position: 'absolute', top: 40, right: 16, zIndex: 10 }}>
        <Button
          variant="link"
          size="sm"
          action="secondary"
          style={{ backgroundColor: 'transparent', minWidth: 40, minHeight: 40, justifyContent: 'center', alignItems: 'center' }}
          onPress={toggleColorMode}
        >
          {colorMode === 'dark' ? (
            <Feather name="sun" color={palette.text} size={24} />
          ) : (
            <Feather name="moon" color={palette.text} size={24} />
          )}
        </Button>
      </Box>
      <Box style={[homeStyles.container, { backgroundColor: palette.background, flex: 1, justifyContent: 'center', paddingBottom: 24 }]}> 
        <Card backgroundColor={colorMode === 'dark' ? '#18181b' : '#fff'}>
          <Text style={[homeStyles.title, { color: palette.text }]}>Bienvenido, {username ? username : 'usuario'}!</Text>
          <Text style={[homeStyles.subtitle, { color: palette.textSecondary }]}>Rol: {jobPosition ? jobPosition : 'No especificado'}</Text>
          <VStack space="md" width="80%" alignItems="center" marginTop={24}>
            <CustomButton
              style={{ width: '100%' }}
              backgroundColor={colorMode === 'dark' ? '#fff' : '#111'}
              textColor={colorMode === 'dark' ? '#111' : '#fff'}
              onPress={handleLogout}
            >
              Cerrar sesión
            </CustomButton>
            <CustomButton
              style={{ width: '100%', marginTop: 12 }}
              backgroundColor={colorMode === 'dark' ? '#4caf50' : '#388e3c'}
              textColor={'#fff'}
              onPress={async () => {
                try {
                  const { status } = await BarCodeScanner.requestPermissionsAsync();
                  if (status === 'granted') {
                    navigation.navigate('BarcodeTest');
                  } else {
                    Toast.show({
                      type: 'error',
                      text1: 'Permiso denegado',
                      text2: 'Debes conceder acceso a la cámara para usar el escáner.',
                      position: 'top',
                    });
                  }
                } catch (e) {
                  Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'No se pudo solicitar el permiso de cámara.',
                    position: 'top',
                  });
                }
              }}
            >
              Probar escáner de código de barras
            </CustomButton>
          </VStack>
        </Card>
      </Box>
    </SafeAreaView>
  );
};

//

export default HomeScreen;
