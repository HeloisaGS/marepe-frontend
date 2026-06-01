import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://marepe-backend.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos para desistir se o Render estiver dormindo
  headers: {
    'Content-Type': 'application/json',
  }
});

// Salvando o token do usuário
api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      console.log('🔑 Token encontrado, enviando na requisição');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ Token não encontrado no AsyncStorage');
    }
  } catch (error) {
    console.error("❌ Erro ao buscar token no Storage", error);
  }
  return config;
});

// Log de erros de resposta e tratamento de 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.error('❌ [API ERROR] Status:', error.response.status);
      console.error('❌ [API ERROR] Data:', error.response.data);
      console.error('❌ [API ERROR] URL:', error.config?.url);

      // Se receber 401, limpar credenciais e redirecionar para login
      if (error.response.status === 401) {
        console.warn('⚠️ Token inválido/expirado (axiosApi). Fazendo logout...');
        try {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('userRole');
          console.log('✅ Credenciais removidas');

          // Importar dinamicamente o router
          const { router } = require('expo-router');
          router.replace('/(auth)');
        } catch (e) {
          console.error('❌ Erro ao fazer logout automático:', e);
        }
      }
    } else if (error.request) {
      console.error('❌ [NETWORK ERROR] Sem resposta do servidor');
    } else {
      console.error('❌ [REQUEST ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

export { api };
export default api;