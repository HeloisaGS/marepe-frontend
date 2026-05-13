import api from './axiosApi';

export const cardapioService = {
  // Buscar cardapio de um vendedor
  getCardapio: async (ambulanteId) => {
    return api.get(`/cliente/ambulante/${ambulanteId}/cardapio`);
  }
};
