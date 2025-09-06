import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

export default function BarcodeScannerModal({ visible, onClose, onScanned }) {
  const [hasPermission, setHasPermission] = React.useState(null);
  const [scanned, setScanned] = React.useState(false);

  useEffect(() => {
    if (visible) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        setScanned(false);
      })();
    }
  }, [visible]);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    onScanned && onScanned(data);
    onClose && onClose();
  };

  if (!visible) return null;
  if (hasPermission === null) return <View style={styles.center}><Text>Solicitando permiso de cámara...</Text></View>;
  if (hasPermission === false) return <View style={styles.center}><Text>Sin acceso a la cámara</Text><Button title="Cerrar" onPress={onClose} /></View>;

  return (
    <View style={styles.overlay}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.center}>
        <Button title="Cerrar" onPress={onClose} color="#fff" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
