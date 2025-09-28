import React from 'react';
import { Box, Text, Button } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

export default function ConfirmacionOperacionScreen() {
  const navigation = useNavigation();
  return (
    <Box flex={1} justifyContent="center" alignItems="center" bg="#fff" px={24}>
      <Text fontSize={22} fontWeight="bold" color="#111" mb={16} textAlign="center">
        ¡Operación enviada al administrador!
      </Text>
      <Text fontSize={16} color="#333" mb={32} textAlign="center">
        Tu orden ha sido registrada como pendiente. Un administrador la procesará y te notificará cuando esté lista para el cobro.
      </Text>
      <Button
        bg="#111"
        borderRadius={8}
        style={{ paddingVertical: 12, minHeight: 44, width: 220, elevation: 2 }}
        onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'CajeroDashboard' }],
        })}
      >
        <Text color="#fff" fontWeight="bold" fontSize={15} style={{ textAlign: 'center' }}>
          Volver al inicio
        </Text>
      </Button>
    </Box>
  );
}
