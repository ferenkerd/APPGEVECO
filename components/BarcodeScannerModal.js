import React, { useEffect, useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Box, VStack, HStack, Button } from '@gluestack-ui/themed';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { CameraView, useCameraPermissions } from 'expo-camera';

// Recibe allProducts para buscar el nombre del producto escaneado

export default function BarcodeScannerModal({ visible, onScanned, onClose, allProducts = [], onAddProduct, scannerMode = 'cerrar', userRole }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [foundProduct, setFoundProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false); // Nuevo flag

  // Reiniciar escáner automáticamente si no se encuentra producto (en cualquier modo)
  useEffect(() => {
    if (scanned && !foundProduct) {
      const timeout = setTimeout(() => {
        setScanned(false);
        setBarcode('');
        setFoundProduct(null);
      }, 1200); // 1.2 segundos para que el usuario vea el mensaje
      return () => clearTimeout(timeout);
    }
  }, [scanned, foundProduct]);

  const handleBarCodeScanned = async ({ type, data }) => {
    setScanned(true);
    setBarcode(data);

    // Flujo por rol
    if (userRole === 3) { // Almacenista
      if (onScanned) onScanned(data); // Pasa el código al input
      if (onClose) setTimeout(onClose, 250); // Cierra modal
      return;
    }

    // Cajero (id 4)
    const product = allProducts.find(p => (p.code || p.barcode) === data);
    setFoundProduct(product || null);
    // Vibración y beep si existe producto
    if (product) {
      try { await Haptics.selectionAsync(); } catch {}
      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../assets/beep.mp3'),
          { shouldPlay: true }
        );
        sound.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) sound.unloadAsync();
        });
      } catch {}
    }
    // En cajero, solo añadir al pulsar 'Añadir'.
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
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
          {!permission ? (
            <View />
          ) : !permission.granted ? (
            <View style={styles.center}>
              <Text>Necesitamos tu permiso para mostrar la cámara</Text>
                <Button
                  bg="#111"
                onPress={requestPermission}
                style={{ borderRadius: 8, marginTop: 8, paddingHorizontal: 16 }}
              >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Conceder permiso</Text>
              </Button>
            </View>
          ) : (
            <>
              <View style={styles.cameraContainer}>
                <CameraView
                  style={styles.camera}
                  barcodeScannerSettings={{
                    barcodeTypes: [
                      'qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'upc_a', 'upc_e', 'pdf417', 'aztec', 'datamatrix',
                    ],
                  }}
                  onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
              </View>
              {/* <Text style={styles.codeText}>{barcode}</Text> */}
              {scanned && foundProduct && (
                <Box bg="#f7f7f7" borderRadius={12} p={14} mb={12} alignItems="center" width={260}>
                  <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 6, color: '#22c55e' }}>Producto encontrado</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 2 }}>{foundProduct.name}</Text>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>
                    Código: {foundProduct.code ? foundProduct.code : foundProduct.barcode ? foundProduct.barcode : foundProduct.id}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 2 }}>Precio: ${foundProduct.sale_price}</Text>
                  <Text style={{ fontSize: 14, color: '#666', marginBottom: 10 }}>Stock: {foundProduct.stock_quantity ?? 'N/A'}</Text>
                  <HStack space="md" width="100%" justifyContent="space-between">
                    <Button
                      variant="outline"
                      borderColor="#111"
                      onPress={() => {
                        setScanned(false);
                        setBarcode('');
                        setFoundProduct(null);
                      }}
                      style={{ borderRadius: 8, paddingHorizontal: 16 }}
                    >
                      <Text style={{ color: '#111', fontWeight: 'bold', fontSize: 15 }}>Reiniciar</Text>
                    </Button>
                    <Button
                      bg="#111"
                      onPress={async () => {
                        setIsAdding(true);
                        if (onAddProduct && foundProduct) {
                          await onAddProduct(foundProduct);
                        }
                        // Cajero: dos modos
                        if (scannerMode === 'continuar') {
                          setTimeout(() => {
                            setScanned(false);
                            setBarcode('');
                            setFoundProduct(null);
                            setIsAdding(false);
                          }, 350);
                        } else if (scannerMode === 'cerrar') {
                          setIsAdding(false);
                          if (onClose) onClose();
                        } else {
                          setIsAdding(false);
                        }
                      }}
                      style={{ borderRadius: 8, paddingHorizontal: 16 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Añadir</Text>
                    </Button>
                  </HStack>

                </Box>
              )}
              {scanned && !foundProduct && (
                <Box alignItems="center" width={260}>
                  <Text style={{ color: 'red', marginBottom: 12 }}>Producto no encontrado</Text>
                </Box>
              )}
              {/* Botón Cerrar eliminado. El modal ahora se cierra al pulsar fuera de la tarjeta */}
            </>
          )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
    height: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  cameraContainer: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'center',
  },
  camera: {
    width: 280,
    height: 180,
    alignSelf: 'center',
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
