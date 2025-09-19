import React, { useEffect, useState } from 'react';
import { Box, Text, VStack, HStack, Divider, Spinner, Button, Input, InputField } from '@gluestack-ui/themed';
import { Select, SelectTrigger, SelectInput, SelectIcon, SelectPortal, SelectBackdrop, SelectContent, SelectDragIndicatorWrapper, SelectDragIndicator, SelectItem } from '@gluestack-ui/themed';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { Icon, SearchIcon } from '@gluestack-ui/themed';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { listSalesByCajero, getSaleDetail } from '../services/api';
import { useNavigation } from '@react-navigation/native';

function formatDate(fecha) {
  if (!fecha) return '';
  const d = new Date(fecha);
  if (isNaN(d)) return fecha;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${mins}`;
}

export default function HistorialOperacionesScreen() {
  const navigation = useNavigation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user } = useAuth();
  const [operaciones, setOperaciones] = useState([]);
    // Handler para descarga de comprobante (placeholder)
    const handleDescargarComprobante = () => {
      // Aquí conectarás el fetch al endpoint cuando esté disponible
      alert('Función no disponible: el backend aún no provee el comprobante.');
    };
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [loading, setLoading] = useState(true);
  const [detalleOperacion, setDetalleOperacion] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    const fetchOperaciones = async () => {
      setLoading(true);
      try {
        const cajeroId = user?.user?.user_id || user?.user?.id || user?.user?.pk || user?.user?.username || user?.user?.email;
        const operacionesData = await listSalesByCajero(cajeroId, user?.access);
        setOperaciones(operacionesData);
      } catch {
        setOperaciones([]);
      }
      setLoading(false);
    };
    if (user?.user) fetchOperaciones();
  }, [user]);

  // Maneja la apertura de detalles
  const handleVerDetalle = async (operacionId) => {
    setLoadingDetalle(true);
    try {
      const detalle = await getSaleDetail(operacionId, user?.access);
      setDetalleOperacion(detalle);
      setSheetOpen(true);
    } catch {
      setDetalleOperacion(null);
    }
    setLoadingDetalle(false);
  };

  // Maneja el cierre de detalles
  const handleCerrarDetalle = () => {
    setSheetOpen(false);
    setDetalleOperacion(null);
  };

  return (
    <Box flex={1} bg="#fff">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 24, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
  <Text fontSize={22} fontWeight="bold" mb={12}>Historial de Operaciones</Text>
        <Box mb={16}>
          <HStack alignItems="center" space="sm" style={{ gap: 12 }}>
            <Box style={{ width: 44, minWidth: 44, maxWidth: 44, marginRight: 8 }}>
              <Select
                selectedValue={searchField}
                onValueChange={setSearchField}
                accessibilityLabel="Filtrar por"
                triggerProps={{ style: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', height: 44, justifyContent: 'center', alignItems: 'center', padding: 0 } }}
              >
                <SelectTrigger style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e0e0e0', height: 44, justifyContent: 'center', alignItems: 'center', padding: 0 }}>
                  <MaterialIcons name="filter-list" size={26} color="#111" />
                </SelectTrigger>
                <SelectPortal>
                  <SelectBackdrop />
                  <SelectContent style={{ backgroundColor: '#fff', borderRadius: 12, width: '100%', maxWidth: '100%', maxHeight: '80%', minHeight: '50%', paddingBottom: 24}}>
                    <SelectDragIndicatorWrapper>
                      <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    <Box style={{ width: '100%', maxWidth: '100%', paddingBottom: 24 }}>
                    <SelectItem label="Todos" value="all" style={{ color: '#111' }} />
                    <SelectItem label="Cliente" value="cliente" style={{ color: '#111' }} />
                    <SelectItem label="Venta (ID)" value="venta" style={{ color: '#111' }} />
                    <SelectItem label="Producto" value="producto" style={{ color: '#111' }} />
                    <SelectItem label="Monto" value="monto" style={{ color: '#111' }} />
                    <SelectItem label="Fecha" value="fecha" style={{ color: '#111' }} />
                  </Box>
                </SelectContent>
              </SelectPortal>
            </Select>
          </Box>
          <Box style={{ flex: 1 }}>
            <Input bg="#f5f5f5" borderRadius={12} px={0} style={{ paddingRight: 36 }}>
                <InputField
                  placeholder={
                    searchField === 'all' ? 'Buscar en todo...' :
                    searchField === 'cliente' ? 'Buscar por cliente...' :
                    searchField === 'venta' ? 'Buscar por ID de venta...' :
                    searchField === 'producto' ? 'Buscar por producto...' :
                    searchField === 'monto' ? 'Buscar por monto...' :
                    searchField === 'fecha' ? 'Buscar por fecha...' :
                    'Buscar...'
                  }
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                  keyboardType={searchField === 'monto' || searchField === 'venta' ? 'numeric' : 'default'}
                  style={{ paddingRight: 36 }}
                />
                <Icon as={SearchIcon} size="md" color="#888" style={{ position: 'absolute', right: 12, top: '50%', transform: [{ translateY: -9 }] }} />
              </Input>
            </Box>
          </HStack>
        </Box>
        {loading ? (
          <Spinner size="large" />
        ) : operaciones.length === 0 ? (
          <Text color="#888">No hay operaciones registradas.</Text>
        ) : (
          <VStack space="md">
            {operaciones
              .filter((venta) => {
                const q = search.toLowerCase();
                if (!q) return true;
                const cliente = venta.client && typeof venta.client === 'object'
                  ? `${venta.client.first_name || ''} ${venta.client.last_name || ''}`
                  : (venta.client_name || venta.client || '');
                const productos = (venta.details || [])
                  .map(item => (item.product && item.product.name ? item.product.name : ''))
                  .join(' ');
                const monto = String(venta.total_amount || '').toLowerCase();
                const fecha = formatDate(venta.sale_date || venta.created_at || venta.fecha || '').toLowerCase();
                if (searchField === 'all') {
                  return (
                    cliente.toLowerCase().includes(q) ||
                    String(venta.id).includes(q) ||
                    productos.toLowerCase().includes(q) ||
                    monto.includes(q) ||
                    fecha.includes(q)
                  );
                } else if (searchField === 'cliente') {
                  return cliente.toLowerCase().includes(q);
                } else if (searchField === 'venta') {
                  return String(venta.id).includes(q);
                } else if (searchField === 'producto') {
                  return productos.toLowerCase().includes(q);
                } else if (searchField === 'monto') {
                  return monto.includes(q);
                } else if (searchField === 'fecha') {
                  return fecha.includes(q);
                }
                return true;
              })
              .map((operacion) => {
                const isPaid = (operacion.status || '').toLowerCase() === 'paid';
                const isPending = (operacion.status || '').toLowerCase() === 'pending';
                const statusColor = isPaid ? '#22bb33' : isPending ? '#ff4444' : '#888';
                const statusText = isPaid ? 'Pagada' : isPending ? 'Pendiente' : (operacion.status || '');
                return (
                  <Box key={operacion.id} borderWidth={1} borderColor="#eee" borderRadius={16} p={16} mb={12} bg="#fff" shadow={1}>
                    <HStack justifyContent="space-between" alignItems="center" mb={2}>
                      <Text fontWeight="bold" fontSize={15} color="#111">Operación #{operacion.id}</Text>
                      <Text fontWeight="bold" fontSize={15} color={statusColor}>{statusText}</Text>
                    </HStack>
                    <Text fontSize={22} fontWeight="bold" color="#111" mb={1}>${operacion.total_amount}</Text>
                    <Text color="#888" fontSize={13} mb={1}>
                      {operacion.details ? `${operacion.details.length} producto${operacion.details.length === 1 ? '' : 's'}` : '0 productos'}
                    </Text>
                    <Text color="#888" fontSize={13} mb={1}>{formatDate(operacion.sale_date || operacion.created_at || operacion.fecha || '')}</Text>
                    <Text color="#111" fontSize={14} mb={1}>
                      Cliente: {operacion.client && typeof operacion.client === 'object'
                        ? `${operacion.client.first_name || ''} ${operacion.client.last_name || ''}`
                        : (operacion.client_name || operacion.client || '')}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleVerDetalle(operacion.id)}
                      style={{ padding: 10, borderRadius: 8, backgroundColor: '#111', marginTop: 10 }}
                    >
                      <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Ver Detalles</Text>
                    </TouchableOpacity>
                  </Box>
                );
              })}
          </VStack>
        )}
  <SelectPortal isOpen={sheetOpen && !!detalleOperacion} onClose={handleCerrarDetalle}>
          <SelectBackdrop onPress={handleCerrarDetalle} />
          <SelectContent style={{ width: '100%', maxWidth: '100%', maxHeight: '80%', minHeight: '50%', paddingBottom: 24 }}>
            <SelectDragIndicatorWrapper>
              <SelectDragIndicator />
            </SelectDragIndicatorWrapper>
            <Box style={{ width: '100%', maxWidth: '100%', paddingBottom: 24 }}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Box px={16} pt={16}>
                  <Text fontSize={22} fontWeight="bold" mb={2}>Operación #{detalleOperacion?.id}</Text>
                  <Text color="#888" fontSize={13} mb={1}>{formatDate(detalleOperacion?.sale_date || detalleOperacion?.created_at || detalleOperacion?.fecha || '')}</Text>
                  <Text mb={2} fontWeight="bold" color={
                    (detalleOperacion?.status || '').toLowerCase() === 'paid' ? '#22bb33' :
                    (detalleOperacion?.status || '').toLowerCase() === 'pending' ? '#ff4444' : '#888'
                  }>
                    Estado: {
                      (detalleOperacion?.status || '').toLowerCase() === 'paid'
                        ? 'Pagada'
                        : (detalleOperacion?.status || '').toLowerCase() === 'pending'
                        ? 'Pendiente'
                        : (detalleOperacion?.status || '')
                    }
                  </Text>
                  <Divider my={8} />
                  <Box mb={2} bg="#f5f6fa" borderRadius={12} px={12} py={10}>
                    <Text fontWeight="bold" color="#111" fontSize={15} style={{ letterSpacing: 1, marginBottom: 6 }}>Cliente</Text>
                    <Text fontSize={15} mb={1} color="#888">
                      {detalleOperacion?.client && typeof detalleOperacion.client === 'object'
                        ? `${detalleOperacion.client.first_name || ''} ${detalleOperacion.client.last_name || ''}`.trim()
                        : (detalleOperacion?.client_name || detalleOperacion?.client || 'Sin cliente')}
                    </Text>
                    {detalleOperacion?.client && typeof detalleOperacion.client === 'object' && (
                      <>
                        {detalleOperacion.client.identity_card && <Text color="#888">Cédula: {detalleOperacion.client.identity_card}</Text>}
                        {detalleOperacion.client.contact_phone && <Text color="#888">Tel: {detalleOperacion.client.contact_phone}</Text>}
                      </>
                    )}
                  </Box>
                  <Divider my={8} />
                  <Box mb={2} bg="#f5f6fa" borderRadius={12} px={12} py={10}>
                    <Text fontWeight="bold" color="#111" fontSize={15} style={{ letterSpacing: 1, marginBottom: 6 }}>Productos</Text>
                    <VStack space="xs" mb={0}>
                      {detalleOperacion?.details && detalleOperacion.details.length > 0 ? detalleOperacion.details.map((item, idx) => {
                        const qty = item.product_quantity || 1;
                        const price = Number(item.sale_price_at_time_of_sale || 0);
                        const total = price * qty;
                        const nombre = item.product && item.product.name ? item.product.name : 'Producto';
                        return (
                          <Box key={idx} mb={2}>
                            <HStack justifyContent="space-between" alignItems="center">
                              <Text color="#888">{nombre}</Text>
                              <Text color="#888">x{qty}</Text>
                              <Text color="#888">${price.toFixed(2)}</Text>
                              <Text color="#888">${total.toFixed(2)}</Text>
                            </HStack>
                          </Box>
                        );
                      }) : <Text color="#888">Sin productos</Text>}
                    </VStack>
                  </Box>
                  <Divider my={8} />
                  <HStack justifyContent="space-between" mb={1}>
                    <Text fontWeight="bold">Subtotal</Text>
                    <Text>${Number(detalleOperacion?.subtotal || detalleOperacion?.total_amount || 0).toFixed(2)}</Text>
                  </HStack>
                  {detalleOperacion?.discount ? (
                    <HStack justifyContent="space-between" mb={1}>
                      <Text fontWeight="bold">Descuento</Text>
                      <Text color="#22bb33">-${Number(detalleOperacion.discount).toFixed(2)}</Text>
                    </HStack>
                  ) : null}
                  {detalleOperacion?.tax ? (
                    <HStack justifyContent="space-between" mb={1}>
                      <Text fontWeight="bold">Impuestos</Text>
                      <Text color="#888">+${Number(detalleOperacion.tax).toFixed(2)}</Text>
                    </HStack>
                  ) : null}
                  <HStack justifyContent="space-between" mb={2}>
                    <Text fontWeight="bold" fontSize={17}>Total</Text>
                    <Text fontWeight="bold" fontSize={17}>${Number(detalleOperacion?.total_amount || 0).toFixed(2)}</Text>
                  </HStack>
                  <Divider my={8} />
                  {detalleOperacion?.payment_method && (
                    <Text mb={1}>Método de pago: <Text fontWeight="bold">{typeof detalleOperacion.payment_method === 'object' ? detalleOperacion.payment_method.name : detalleOperacion.payment_method}</Text></Text>
                  )}
                  {detalleOperacion?.user && (
                    <Text mb={1}>Vendedor: <Text fontWeight="bold">{typeof detalleOperacion.user === 'object' ? (detalleOperacion.user.username || detalleOperacion.user.email || detalleOperacion.user.first_name || '') : detalleOperacion.user}</Text></Text>
                  )}
                  {detalleOperacion?.notes && (
                    <Box mt={2}>
                      <Text fontWeight="bold">Notas:</Text>
                      <Text color="#888">{detalleOperacion.notes}</Text>
                    </Box>
                  )}

                  {/* Botón al fondo del sheet */}
                  <Button
                    mt={4}
                    mb={2}
                    bg="#111"
                    borderRadius={8}
                    onPress={handleDescargarComprobante}
                  >
                    <Text color="#fff" fontWeight="bold">Descargar comprobante</Text>
                  </Button>
                </Box>
              </ScrollView>
            </Box>
            {loadingDetalle && (
              <Box position="absolute" top={0} left={0} right={0} bottom={0} bg="#fff8" justifyContent="center" alignItems="center">
                <Spinner size="large" />
              </Box>
            )}
          </SelectContent>
        </SelectPortal>
      </ScrollView>
    </Box>
  );
}
