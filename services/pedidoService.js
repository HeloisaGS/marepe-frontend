import api from './axiosApi';

export const pedidoService = {
  // Cliente cria pedido
  criarPedido: async (ambulanteId, categorias, itens = null) => {
    return api.post('/api/pedidos', {
      ambulante_id: ambulanteId,
      categorias: categorias,
      itens: itens
    });
  },

  // Cliente cancela pedido
  cancelarPedido: async (pedidoId) => {
    return api.delete(`/api/pedidos/${pedidoId}`);
  },

  // Cliente lista seus pedidos
  listarPedidosCliente: async () => {
    return api.get('/api/pedidos/cliente');
  },

  // Ambulante lista fila de pedidos
  listarFilaPedidos: async () => {
    return api.get('/api/ambulante/pedidos/fila');
  },

  // Ambulante lista seus pedidos
  listarPedidosAmbulante: async () => {
    return api.get('/api/pedidos/ambulante');
  },

  // Ambulante aceita pedido
  aceitarPedido: async (pedidoId) => {
    return api.patch(`/api/pedidos/${pedidoId}/aceitar`);
  },

  // Ambulante nega pedido
  negarPedido: async (pedidoId) => {
    return api.patch(`/api/pedidos/${pedidoId}/negar`);
  },

  // Ambulante atualiza status
  atualizarStatusPedido: async (pedidoId, status) => {
    return api.patch(`/api/pedidos/${pedidoId}/status`, { status });
  }
};
