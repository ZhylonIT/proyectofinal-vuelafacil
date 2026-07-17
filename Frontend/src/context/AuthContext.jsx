import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { getToken, setToken } from '../services/apiClient';

const USER_KEY = 'vuelafacil_user';
const AuthContext = createContext(null);

function mapUsuario(usuario) {
  if (!usuario) return null;
  return {
    id: usuario.id,
    firstName: usuario.nombre,
    lastName: usuario.apellido,
    email: usuario.email,
    role: (usuario.rol || '').toLowerCase(),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });

  const persistSession = useCallback((token, usuario) => {
    const mapped = mapUsuario(usuario);
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(mapped));
    setUser(mapped);
    return mapped;
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, usuario } = await authService.login(email, password);
    return persistSession(token, usuario);
  }, [persistSession]);

  const register = useCallback((datos) => authService.registro(datos), []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('vuelafacil:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vuelafacil:unauthorized', handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && getToken()),
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
  }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}