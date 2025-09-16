import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthToken } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      // In a real app, you'd verify the token and get user info
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const authToken: AuthToken = await authAPI.login({ username, password });
      setToken(authToken.access_token);
      localStorage.setItem('token', authToken.access_token);
      // In a real app, you'd decode the token or make another API call to get user info
      setUser({ id: 1, username, email: '', is_active: true, created_at: '' });
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, username: string, password: string) => {
    try {
      const user = await authAPI.register({ email, username, password });
      setUser(user);
      // Auto-login after registration
      await login(username, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};