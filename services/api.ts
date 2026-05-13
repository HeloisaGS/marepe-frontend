import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the configured API URL or fallback to production
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://marepe-backend.onrender.com';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar token do AsyncStorage
    this.client.interceptors.request.use(async (config) => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          console.log('🔑 Token encontrado (ApiClient), enviando na requisição');
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          console.warn('⚠️ Token não encontrado no AsyncStorage (ApiClient)');
        }
      } catch (error) {
        console.error('❌ Erro ao buscar token no Storage (ApiClient)', error);
      }
      return config;
    });

    // Interceptor de resposta para logs
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          console.error('❌ [API ERROR] Status:', error.response.status);
          console.error('❌ [API ERROR] Data:', error.response.data);
          console.error('❌ [API ERROR] URL:', error.config?.url);
        } else if (error.request) {
          console.error('❌ [NETWORK ERROR] Sem resposta do servidor');
        } else {
          console.error('❌ [REQUEST ERROR]', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // ========== MÉTODOS GENÉRICOS ==========

  async get(url: string, config?: any) {
    const response = await this.client.get(url, config);
    return response;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.client.post(url, data, config);
    return response;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.client.put(url, data, config);
    return response;
  }

  async patch(url: string, data?: any, config?: any) {
    const response = await this.client.patch(url, data, config);
    return response;
  }

  async delete(url: string, config?: any) {
    const response = await this.client.delete(url, config);
    return response;
  }

  // ========== PEDIDOS ==========

  /**
   * Criar novo pedido (cliente)
   */
  async criarPedido(ambulanteId: string, categorias: string[]) {
    const response = await this.client.post('/api/pedidos', {
      ambulante_id: ambulanteId,
      categorias,
    });
    return response.data;
  }

  /**
   * Listar fila de pedidos (ambulante)
   */
  async listarFilaPedidos() {
    const response = await this.client.get('/api/ambulante/pedidos/fila');
    return response.data;
  }

  /**
   * Aceitar pedido (ambulante)
   */
  async aceitarPedido(pedidoId: string) {
    const response = await this.client.patch(`/api/pedidos/${pedidoId}/aceitar`);
    return response.data;
  }

  /**
   * Negar pedido (ambulante)
   */
  async negarPedido(pedidoId: string) {
    const response = await this.client.patch(`/api/pedidos/${pedidoId}/negar`);
    return response.data;
  }

  /**
   * Cancelar pedido (cliente)
   */
  async cancelarPedido(pedidoId: string) {
    const response = await this.client.delete(`/api/pedidos/${pedidoId}`);
    return response.data;
  }

  // ========== VENDEDOR ==========

  /**
   * Listar categorias disponíveis
   */
  async listarCategorias() {
    const response = await this.client.get('/vendedor/catalogo/categorias');
    return response.data;
  }

  /**
   * Atualizar catálogo do vendedor
   */
  async atualizarCatalogo(categorias: string[]) {
    const response = await this.client.put('/vendedor/catalogo', { categorias });
    return response.data;
  }

  /**
   * Atualizar status do vendedor
   */
  async atualizarStatus(status: 'online' | 'offline' | 'paused' | 'em_atendimento') {
    const response = await this.client.put('/vendedor/status', { status });
    return response.data;
  }

  /**
   * Salvar localização do vendedor
   */
  async salvarLocalizacao(latitude: number, longitude: number, accuracy: number) {
    const response = await this.client.post('/vendedor/location', {
      latitude,
      longitude,
      accuracy,
    });
    return response.data;
  }
}

export const api = new ApiClient();

export default api;
