import React from 'react';
import { View, Button } from 'react-native';
import Toast from 'react-native-toast-message';

export default function ToastTestScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Button
        title="Mostrar Toast de Éxito"
        onPress={() => {
          console.log('[TOAST] success', {
            type: 'success',
            text1: '¡Éxito!',
            text2: 'Este es un toast de éxito.',
            position: 'top',
          });
          Toast.show({
            type: 'success',
            text1: '¡Éxito!',
            text2: 'Este es un toast de éxito.',
            position: 'top',
          });
        }}
      />
      <Button
        title="Mostrar Toast de Error"
        color="#d32f2f"
        onPress={() => {
          console.log('[TOAST] error', {
            type: 'error',
            text1: 'Error',
            text2: 'Este es un toast de error.',
            position: 'top',
          });
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Este es un toast de error.',
            position: 'top',
          });
        }}
        style={{ marginTop: 16 }}
      />
      <Button
        title="Mostrar Toast de Info"
        color="#1976d2"
        onPress={() => {
          console.log('[TOAST] info', {
            type: 'info',
            text1: 'Info',
            text2: 'Este es un toast informativo.',
            position: 'top',
          });
          Toast.show({
            type: 'info',
            text1: 'Info',
            text2: 'Este es un toast informativo.',
            position: 'top',
          });
        }}
        style={{ marginTop: 16 }}
      />
    </View>
  );
}
