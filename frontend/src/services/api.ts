import axios from 'axios';
import { LoginCredentials, RegisterCredentials, AuthToken, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthToken> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (credentials: RegisterCredentials): Promise<User> => {
    const response = await api.post('/auth/register', credentials);
    return response.data;
  },
};

export const stockAPI = {
  searchStock: async (symbol: string) => {
    const response = await api.get(`/stocks/search/${symbol}`);
    return response.data;
  },

  screenStocks: async (filters: any) => {
    const response = await api.post('/stocks/screen', filters);
    return response.data;
  },

  getWatchlist: async () => {
    const response = await api.get('/stocks/watchlist');
    return response.data;
  },

  addToWatchlist: async (symbol: string) => {
    const response = await api.post(`/stocks/watchlist/add/${symbol}`);
    return response.data;
  },

  removeFromWatchlist: async (symbol: string) => {
    const response = await api.delete(`/stocks/watchlist/remove/${symbol}`);
    return response.data;
  },

  getAnalysis: async (symbol: string) => {
    const response = await api.get(`/stocks/${symbol}/analysis`);
    return response.data;
  },

  populateStocks: async () => {
    const response = await api.post('/stocks/populate');
    return response.data;
  },
};

export default api;