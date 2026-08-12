import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { setAuthToken } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const savedToken = await AsyncStorage.getItem('token');
      if (savedToken) {
        setAuthToken(savedToken);
        setToken(savedToken);
        try {
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        } catch (e) {
          await AsyncStorage.removeItem('token');
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (identifier, password) => {
    const { data } = await api.post('/auth/login', { identifier, password });
    await AsyncStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    await AsyncStorage.setItem('token', data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
