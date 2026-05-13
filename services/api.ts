import axios, { AxiosInstance } from 'axios';

// Use the same default as axiosApi.js for consistency
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.21:8000';

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

    // Interceptor para adicionar token
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
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
