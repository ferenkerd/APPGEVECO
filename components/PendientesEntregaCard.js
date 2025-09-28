import React, { useEffect, useState, useRef, useImperativeHandle } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Animated, Easing } from 'react-native';
import { Box, Text, VStack, HStack, Spinner, Pressable } from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { listSalesByCajero } from '../services/api';


const PendientesEntregaCard = React.forwardRef((props, ref) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const blinkAnim = useRef(new Animated.Value(1));

  // Función reutilizable para recargar ventas
  const fetchVentas = async () => {
    setLoading(true);
    try {
      const cajeroId = user?.user?.user_id || user?.user?.id || user?.user?.pk || user?.user?.username || user?.user?.email;
      const data = await listSalesByCajero(cajeroId, user?.access);
      setVentas((data || []).filter(v => {
        const status = (v.status || '').toLowerCase();
        const delivered = v.delivered === true
          || (typeof v.delivery_status === 'string' && v.delivery_status.toLowerCase() === 'delivered')
          || (!!v.delivered_at && v.delivered_at !== 'null' && v.delivered_at !== null && v.delivered_at !== undefined && v.delivered_at !== '');
        return status === 'paid' && !delivered;
      }));
    } catch {
      setVentas([]);
    }
    setLoading(false);
  };

  // Exponer método refetch para refresco manual
  useImperativeHandle(ref, () => ({
    refetch: fetchVentas
  }));

  // Recargar automáticamente al recibir foco
  useFocusEffect(
    React.useCallback(() => {
      fetchVentas();
    }, [user])
  );

  useEffect(() => {
    let loop;
    if (ventas.length) {
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim.current, { toValue: 0.2, duration: 600, useNativeDriver: true, easing: Easing.linear }),
          Animated.timing(blinkAnim.current, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.linear })
        ])
      );
      loop.start();
    } else {
      blinkAnim.current.setValue(1);
    }
    return () => {
      if (loop) loop.stop();
    };
  }, [ventas.length]);


  if (loading) {
    return (
      <Box bg="#fffbe6" borderRadius={16} p={16} mb={16} alignItems="center" justifyContent="center">
        <Spinner size="small" />
        <Text color="#888" mt={2}>Cargando ventas pendientes...</Text>
      </Box>
    );
  }

  if (!ventas.length) {
    return null;
  }

  return (
    <Box px={16} py={12}>
      <Pressable
        onPress={() => navigation.navigate('OrdenesPendientesEntrega')}
        style={{ width: '100%' }}
      >
        <Box bg="#fff" borderRadius={16} p={20} alignItems="center" justifyContent="center" shadow={2} borderWidth={2} borderColor="#111" position="relative">
          {/* Puntito rojo animado en la esquina superior derecha */}
          {ventas.length > 0 && (
            <Animated.View
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: 'red',
                opacity: blinkAnim.current,
                borderWidth: 2,
                borderColor: '#fff',
                zIndex: 10
              }}
              accessibilityLabel="Notificación de órdenes por entregar"
            />
          )}
          <Text fontWeight="bold" fontSize={19} color="#111" mb={2}>Órdenes por entregar</Text>
          <Text color="#111" fontSize={15} mb={2}>{ventas.length} venta(s) pagada(s) y no entregada(s)</Text>
          <Text color="#111" fontSize={13}>Toca para ver y entregar</Text>
        </Box>
      </Pressable>
    </Box>
  );
});

export default PendientesEntregaCard;
