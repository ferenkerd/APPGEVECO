import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export default function CameraBarcodeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        ref={cameraRef}
        barCodeScannerSettings={{
          barCodeTypes: [
            Camera.Constants.BarCodeType.qr,
            Camera.Constants.BarCodeType.ean13,
            Camera.Constants.BarCodeType.ean8,
            Camera.Constants.BarCodeType.code128,
            Camera.Constants.BarCodeType.code39,
            Camera.Constants.BarCodeType.code93,
            Camera.Constants.BarCodeType.upc_a,
            Camera.Constants.BarCodeType.upc_e,
            Camera.Constants.BarCodeType.pdf417,
            Camera.Constants.BarCodeType.aztec,
            Camera.Constants.BarCodeType.datamatrix,
          ],
        }}
      />
      {scanned && (
        <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />
      )}
      <Text style={{ textAlign: 'center', margin: 16 }}>{barcode}</Text>
    </View>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Camera } from 'expo-camera';

export default function CameraBarcodeScreen() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
  };

  if (hasPermission === null) {
    return <Text>Solicitando permiso de cámara...</Text>;
  }
  if (hasPermission === false) {
    return <Text>Sin acceso a la cámara</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      <Camera
        style={StyleSheet.absoluteFillObject}
        type={Camera.Constants.Type.back}
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        ref={cameraRef}
        barCodeScannerSettings={{
          barCodeTypes: [
            Camera.Constants.BarCodeType.qr,
            Camera.Constants.BarCodeType.ean13,
            Camera.Constants.BarCodeType.ean8,
            Camera.Constants.BarCodeType.code128,
            Camera.Constants.BarCodeType.code39,
            Camera.Constants.BarCodeType.code93,
            Camera.Constants.BarCodeType.upc_a,
            Camera.Constants.BarCodeType.upc_e,
            Camera.Constants.BarCodeType.pdf417,
            Camera.Constants.BarCodeType.aztec,
            Camera.Constants.BarCodeType.datamatrix,
          ],
        }}
      />
      {scanned && (
        <Button title={'Escanear de nuevo'} onPress={() => setScanned(false)} />
      )}
      <Text style={{ textAlign: 'center', margin: 16 }}>{barcode}</Text>
    </View>
  );
}
