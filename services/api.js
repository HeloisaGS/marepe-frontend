import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://marepe-backend.onrender.com',
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
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Erro ao buscar token no Storage", error);
  }
  return config;
});

export default api;