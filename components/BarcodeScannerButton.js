import React from 'react';
import { Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function BarcodeScannerButton({ onPress }) {
  return (
    <Pressable onPress={onPress} style={{ marginLeft: 8, justifyContent: 'center', alignItems: 'center' }}>
      <MaterialIcons name="qr-code-scanner" size={28} color="#666" />
    </Pressable>
  );
}
