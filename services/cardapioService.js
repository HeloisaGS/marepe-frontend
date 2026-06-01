import api from './axiosApi';

export const cardapioService = {
  // CLIENTE - Buscar cardapio de um vendedor
  getCardapio: async (ambulanteId) => {
    return api.get(`/cliente/ambulante/${ambulanteId}/cardapio`);
  },

  // VENDEDOR - Gerenciar produtos próprios
  getMeusProdutos: async () => {
    return api.get('/vendedor/produtos');
  },

  criarProduto: async (produtoData) => {
    return api.post('/vendedor/produtos', produtoData);
  },

  atualizarProduto: async (produtoId, produtoData) => {
    return api.put(`/vendedor/produtos/${produtoId}`, produtoData);
  },

  deletarProduto: async (produtoId) => {
    return api.delete(`/vendedor/produtos/${produtoId}`);
  },

  toggleDisponibilidade: async (produtoId) => {
    return api.patch(`/vendedor/produtos/${produtoId}/toggle`);
  }
};
