import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('disastersim_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('disastersim_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authService.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('disastersim_user', JSON.stringify(userData));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem('disastersim_token', res.token);
    localStorage.setItem('disastersim_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password, role = 'EMPLOYEE') => {
    const res = await authService.register({ name, email, password, role });
    localStorage.setItem('disastersim_token', res.token);
    localStorage.setItem('disastersim_user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('disastersim_token');
    localStorage.removeItem('disastersim_user');
    setToken(null);
    setUser(null);
  };

  const quickLogin = async (roleType) => {
    if (roleType === 'ADMIN') {
      return login('admin@disastersim.ai', 'Admin123!');
    } else {
      return login('sarah.chen@enterprise.com', 'Employee123!');
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
    quickLogin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
