// Obtener métodos de pago disponibles
export async function getPaymentMethods(accessToken) {
  return apiFetch('payment-methods/', { method: 'GET' }, accessToken);
}
// Listar ventas por cajero (usuario actual)
export async function listSalesByCajero(cajeroId, accessToken) {
  // Asumiendo que el backend soporta filtro por cajero (user o cashier)
  return apiFetch(`sales/?cajero=${cajeroId}`, { method: 'GET' }, accessToken);
}
// --- VENTAS Y PAGOS ---

// Crear una venta u orden
export async function createSale(saleData, accessToken) {
  return apiFetch('sales/', {
    method: 'POST',
    body: JSON.stringify(saleData)
  }, accessToken);
}

// Listar ventas (opcional: status)
export async function listSales(status = '', accessToken) {
  const url = status ? `sales/?status=${status}` : 'sales/';
  return apiFetch(url, { method: 'GET' }, accessToken);
}

// Obtener detalle de una venta
export async function getSaleDetail(saleId, accessToken) {
  return apiFetch(`sales/${saleId}/`, { method: 'GET' }, accessToken);
}

// Registrar pago de una venta
export async function registerPayment(paymentData, accessToken) {
  return apiFetch('payments/', {
    method: 'POST',
    body: JSON.stringify(paymentData)
  }, accessToken);
}

// Consultar modo de cobro actual
export async function getPaymentMode(accessToken) {
  return apiFetch('business/payment-mode/', { method: 'GET' }, accessToken);
}

// Cambiar modo de cobro (solo admin)
export async function setPaymentMode(mode, accessToken) {
  return apiFetch('business/payment-mode/', {
    method: 'POST',
    body: JSON.stringify({ mode })
  }, accessToken);
}
import { devLog } from '../utils/logger';
import { Storage } from './storage';

const API_BASE_URL = 'https://zp5qjj4n-8000.use2.devtunnels.ms/';

// Refresca el token de acceso usando el refresh token
async function refreshAccessToken() {
  const refresh = await Storage.getItem('refresh');
  if (!refresh) throw new Error('No refresh token');
  const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw new Error('No se pudo refrescar el token');
  const data = await res.json();
  await Storage.setItem('access', data.access);
  return data.access;
}

// Función principal para peticiones a la API con refresco automático de token
export async function apiFetch(endpoint, options = {}, token = null) {
  devLog('apiFetch called', { endpoint, options, token });
  let accessToken = token || await Storage.getItem('access');
  let headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  const url = `${API_BASE_URL}${endpoint}`;
  devLog('apiFetch: URL', url);
  devLog('apiFetch: options', { ...options, headers });

  let response = await fetch(url, { ...options, headers });
  devLog('apiFetch: status', response.status);

  // Si el token está expirado, intentar refrescar y reintentar una vez
  if ((response.status === 401 || response.status === 403) && accessToken) {
    devLog('apiFetch: intentando refrescar token...');
    try {
      accessToken = await refreshAccessToken();
      headers = {
        ...(options.headers || {}),
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
      response = await fetch(url, { ...options, headers });
      devLog('apiFetch: status (tras refresh)', response.status);
    } catch (e) {
      // Si el refresh falla, forzar logout
      if (global.navigationRef && global.navigationRef.current) {
        global.navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
      if (global.Storage) {
        global.Storage.deleteItem && global.Storage.deleteItem('access');
        global.Storage.deleteItem && global.Storage.deleteItem('refresh');
      }
      throw new Error('Sesión expirada o no autorizada');
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    devLog('apiFetch: error', errorText);
    throw new Error('Error en la petición a la API');
  }
  const data = await response.json();
  devLog('apiFetch: data', data);
  return data;
}

// Obtener prefijos (requiere autenticación)
export async function getPrefixes(accessToken) {
  return apiFetch('prefixes/', { method: 'GET' }, accessToken);
}

// Registrar un nuevo cliente (requiere accessToken)
export async function registerClient(clientData, accessToken) {
  return apiFetch(
    'clients/register/',
    {
      method: 'POST',
      body: JSON.stringify(clientData)
    },
    accessToken
  );
}

// Logout de usuario
export async function logoutApi(accessToken, refreshToken) {
  devLog('logoutApi called', { accessToken, refreshToken });
  return apiFetch(
    'auth/logout/',
    {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken })
    },
    accessToken
  );
}

// Buscar cliente por cédula (requiere accessToken)
export async function searchClientByCedula(cedula, accessToken) {
  return apiFetch(`clients/search-by-cedula/?cedula=${encodeURIComponent(cedula)}`, { method: 'GET' }, accessToken);
}

