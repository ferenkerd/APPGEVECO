// Obtener prefijos (requiere autenticación)
export async function getPrefixes(accessToken) {
  return apiFetch('prefixes/', { method: 'GET' }, accessToken);
}
// Registrar un nuevo cliente (requiere accessToken)
// Campos esperados: first_name, last_name, identity_card, gender, contact_phone, address
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
import { devLog } from '../utils/logger';

// --- Constantes ---
const API_BASE_URL = 'https://zp5qjj4n-8000.use2.devtunnels.ms/';

// --- Función utilitaria principal ---
export async function apiFetch(endpoint, options = {}, token = null) {
  devLog('apiFetch called', { endpoint, options, token });
  const headers = {
    ...(options.headers || {}),
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const url = `${API_BASE_URL}${endpoint}`;
  devLog('apiFetch: URL', url);
  devLog('apiFetch: options', { ...options, headers });

  const response = await fetch(url, {
    ...options,
    headers,
  });

  devLog('apiFetch: status', response.status);

  if (response.status === 401 || response.status === 403) {
    // Token inválido o expirado: forzar logout y redirección global
    if (global.navigationRef && global.navigationRef.current) {
      global.navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
    // Limpiar storage si existe
    if (global.Storage) {
      global.Storage.deleteItem && global.Storage.deleteItem('access');
      global.Storage.deleteItem && global.Storage.deleteItem('refresh');
    }
    throw new Error('Sesión expirada o no autorizada');
  }

  if (!response.ok) {
    // Manejo de errores global
    const errorText = await response.text();
    devLog('apiFetch: error', errorText);
    throw new Error('Error en la petición a la API');
  }
  const data = await response.json();
  devLog('apiFetch: data', data);
  return data;
}

// --- Funciones específicas de API ---

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

// Ejemplo de uso:
// import { apiFetch } from '../services/api';
// const data = await apiFetch('/ruta/', { method: 'GET' });
