import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000';

// Create axios instance
const client: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error retrieving auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized - clear token and reject
    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('auth_token');
      } catch (e) {
        console.error('Error clearing auth token:', e);
      }
    }
    return Promise.reject(error);
  }
);

export default client;
