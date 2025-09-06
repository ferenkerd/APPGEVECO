// ...existing code...
import { devLog } from '../utils/logger';
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Storage } from '../services/storage';
import { apiFetch, logoutApi } from '../services/api';

const AuthContext = createContext();

// Decodifica el JWT y retorna el payload
function parseJwt(token) {
  devLog('parseJwt called', token);
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refresca el token si está expirado
  const refreshAccessToken = async (refresh) => {
    devLog('refreshAccessToken called', refresh);
    try {
      const data = await apiFetch('/auth/token/refresh/', {
        method: 'POST',
        body: JSON.stringify({ refresh }),
      });
  await Storage.setItem('access', data.access);
  setUser((prev) => ({ ...prev, access: data.access }));
      return data.access;
    } catch {
      await logout();
      return null;
    }
  };

  useEffect(() => {
    devLog('AuthContext useEffect (mount)');
    // Check for tokens on mount
    const loadTokens = async () => {
      devLog('loadTokens called');
      try {
        // Asegura que SecureStore está bien importado y usa getItemAsync
  const access = await Storage.getItem('access');
  const refresh = await Storage.getItem('refresh');
  devLog('AuthContext: access', access);
  devLog('AuthContext: refresh', refresh);
        if (access && refresh) {
          // Verifica expiración del access token
          const payload = parseJwt(access);
          const now = Math.floor(Date.now() / 1000);
          devLog('AuthContext: payload', payload);
          if (payload && payload.exp && payload.exp < now) {
            // Token expirado, intenta refrescar
            const newAccess = await refreshAccessToken(refresh);
            if (newAccess) {
              setUser({ access: newAccess, refresh });
            } else {
              setUser(null);
            }
          } else {
            setUser({ access, refresh });
          }
        }
      } catch (e) {
  devLog('AuthContext error:', e);
      } finally {
        setLoading(false);
      }
    };
    loadTokens();
  }, []);

  const login = async (username, password) => {
    devLog('login called', username);
    try {
      // No se pasa token en login
      const data = await apiFetch('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
  devLog('AuthContext: login data', data);
      if (data.access && data.refresh) {
        await Storage.setItem('access', data.access);
        await Storage.setItem('refresh', data.refresh);
        setUser({ access: data.access, refresh: data.refresh, user: data.user });
        return true;
      } else {
  devLog('AuthContext: login response missing tokens', data);
        return false;
      }
    } catch (e) {
  devLog('AuthContext: login error', e);
      return false;
    }
  };

  const logout = async () => {
    devLog('logout called');
    try {
      const access = await Storage.getItem('access');
      const refresh = await Storage.getItem('refresh');
      if (access && refresh) {
        await logoutApi(access, refresh);
      }
    } catch (e) {
  devLog('Logout API error:', e);
    }
    await Storage.deleteItem('access');
    await Storage.deleteItem('refresh');
    setUser(null);
  };

  // Hook para obtener el access token válido automáticamente
  const getValidAccessToken = async () => {
    devLog('getValidAccessToken called');
    if (!user) return null;
    const payload = parseJwt(user.access);
    const now = Math.floor(Date.now() / 1000);
    if (payload && payload.exp && payload.exp < now) {
      // Expirado, refresca
      return await refreshAccessToken(user.refresh);
    }
    return user.access;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getValidAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
