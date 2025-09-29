// ...existing code...
import { devLog } from '../utils/logger';
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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
      // Redirigir al login si el refresh falla
      redirectToLogin();
      return null;
    }
  };

  const pingInterval = useRef();
  // Redirige al login usando navigation root
  const redirectToLogin = () => {
    // Usar NavigationContainerRef para navegar fuera de componentes
    if (global.navigationRef && global.navigationRef.current) {
      global.navigationRef.current.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  useEffect(() => {
    // Check for tokens on mount
    const loadTokens = async () => {
      try {
        const access = await Storage.getItem('access');
        const refresh = await Storage.getItem('refresh');
        if (access && refresh) {
          let currentAccess = access;
          const payload = parseJwt(access);
          const now = Math.floor(Date.now() / 1000);
          if (payload && payload.exp && payload.exp < now) {
            const newAccess = await refreshAccessToken(refresh);
            if (newAccess) {
              currentAccess = newAccess;
            } else {
              setUser(null);
              redirectToLogin();
              setLoading(false);
              return;
            }
          }
          // Poblar user.user solo con los datos del token decodificado
          let userObj = {};
          if (payload) {
            userObj = {
              username: payload.username,
              job_position: payload.job_position || payload.role,
              is_superuser: payload.is_superuser,
              user_id: payload.user_id || payload.user_id || payload.sub || payload.id,
            };
          }
          setUser({ access: currentAccess, refresh, user: userObj });
        }
      } catch (e) {
        // Silenciar logs
      } finally {
        setLoading(false);
      }
    };
    loadTokens();
    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
    };
  }, []);

  // Intervalo para mantener la sesión activa (solo uno activo)
  useEffect(() => {
    if (pingInterval.current) clearInterval(pingInterval.current);
    if (user && user.access && user.refresh) {
      pingInterval.current = setInterval(async () => {
        try {
          // Verificar si el token de acceso está expirado
          const payload = parseJwt(user.access);
          const now = Math.floor(Date.now() / 1000);
          let accessToken = user.access;
          if (payload && payload.exp && payload.exp < now) {
            // Si expiró, refrescar
            const newAccess = await refreshAccessToken(user.refresh);
            if (newAccess) {
              accessToken = newAccess;
            } else {
              // Si no se pudo refrescar, salir
              return;
            }
          }
          await apiFetch('auth/ping/', { method: 'GET' }, accessToken);
        } catch (e) {
          // Silenciar logs
        }
      }, 240000); // 4 minutos
    }
    return () => {
      if (pingInterval.current) clearInterval(pingInterval.current);
    };
  }, [user]);

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
        // Usar el objeto user que viene en la respuesta del login
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
    if (!user) {
      redirectToLogin();
      return null;
    }
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
