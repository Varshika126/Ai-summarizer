import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync authorization headers whenever user changes
  useEffect(() => {
    if (user && user.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
      fetchSettings();
    } else {
      delete api.defaults.headers.common['Authorization'];
      setSettings(null);
    }
    setLoading(false);
  }, [user]);

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setSettings(null);
    localStorage.removeItem('user');
  };

  const updateProfile = async (name, email) => {
    const { data } = await api.put('/api/auth/profile', { name, email });
    const updatedUser = { ...user, name: data.name, email: data.email, token: data.token };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const updatePassword = async (currentPassword, newPassword) => {
    const { data } = await api.put('/api/auth/password', { currentPassword, newPassword });
    return data;
  };

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/api/settings');
      setSettings(data);
      
      // Update local storage and DOM to match db theme
      if (data.theme) {
        localStorage.setItem('theme', data.theme);
        const root = window.document.documentElement;
        if (data.theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    } catch (err) {
      console.error('Failed to retrieve user settings:', err.message);
    }
  };

  const updateSettingsState = async (newSettings) => {
    const { data } = await api.put('/api/settings', newSettings);
    setSettings(data);
    
    if (data.theme) {
      localStorage.setItem('theme', data.theme);
      const root = window.document.documentElement;
      if (data.theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        loading,
        login,
        register,
        logout,
        updateProfile,
        updatePassword,
        fetchSettings,
        updateSettings: updateSettingsState
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
