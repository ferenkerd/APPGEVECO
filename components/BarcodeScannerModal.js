import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

export default function BarcodeScannerModal({ visible, onScanned, onClose }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    onScanned && onScanned(data);
  };

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setBarcode('');
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {!permission ? (
            <View />
          ) : !permission.granted ? (
            <View style={styles.center}>
              <Text>Necesitamos tu permiso para mostrar la cámara</Text>
              <Button onPress={requestPermission} title="Conceder permiso" />
            </View>
          ) : (
            <>
              <CameraView
                style={styles.camera}
                facing="back"
                barcodeScannerSettings={{
                  barcodeTypes: [
                    'qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'upc_a', 'upc_e', 'pdf417', 'aztec', 'datamatrix',
                  ],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              <Text style={styles.codeText}>{barcode}</Text>
              <Button title={scanned ? 'Escanear de nuevo' : 'Cerrar'} onPress={scanned ? () => { setScanned(false); setBarcode(''); } : onClose} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: 250,
  },
  codeText: {
    marginVertical: 16,
    fontSize: 18,
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
