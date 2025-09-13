import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Button, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Recibe allProducts para buscar el nombre del producto escaneado
export default function BarcodeScannerModal({ visible, onScanned, onClose, allProducts = [] }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setBarcode(data);
    // Buscar producto por code o barcode
    const product = allProducts.find(p => (p.code || p.barcode) === data);
    setFoundProduct(product || null);
  };

  useEffect(() => {
    if (visible) {
      setScanned(false);
      setBarcode('');
      setFoundProduct(null);
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
              <View style={styles.cameraContainer}>
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
              </View>
              <Text style={styles.codeText}>{barcode}</Text>
              {scanned && foundProduct && (
                <View style={{ alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>Producto encontrado:</Text>
                  <Text style={{ fontSize: 16 }}>{foundProduct.name}</Text>
                  <Button title="Añadir" onPress={() => { onScanned && onScanned(barcode); }} />
                </View>
              )}
              {scanned && !foundProduct && (
                <Text style={{ color: 'red', marginBottom: 12 }}>Producto no encontrado</Text>
              )}
              <Button title={scanned ? 'Escanear de nuevo' : 'Cerrar'} onPress={scanned ? () => { setScanned(false); setBarcode(''); setFoundProduct(null); } : onClose} />
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
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraContainer: {
    width: '100%',
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 16,
  },
  camera: {
    width: '100%',
    flex: 1,
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
