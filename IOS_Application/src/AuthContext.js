import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedApiKey = await AsyncStorage.getItem('apiKey');
      if (storedUsername && storedApiKey) {
        setUsername(storedUsername);
        setApiKey(storedApiKey);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Failed to load auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (user, key) => {
    await AsyncStorage.setItem('username', user);
    await AsyncStorage.setItem('apiKey', key);
    setUsername(user);
    setApiKey(key);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('username');
    await AsyncStorage.removeItem('apiKey');
    setUsername(null);
    setApiKey(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, username, apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
