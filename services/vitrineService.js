import api from './api';

export const vitrineService = {
  getCategorias: async () => {
    return api.get('/vendedor/categorias');
  },

  salvarCatalogo: async (categorias) => {
    return api.put('/vendedor/catalogo', {
      categorias
    });
  },

  getMeuCatalogo: async () => {
    return api.get('/vendedor/catalogo');
  }
};