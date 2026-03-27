import axios from 'axios';

const api = axios.create({
  baseURL: 'https://marepe-backend.onrender.com',
  timeout: 10000, // 10 segundos para desistir se o Render estiver dormindo
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;