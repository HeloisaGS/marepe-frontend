import api from './axiosApi';

export const vitrineService = {
  getCategorias: async () => {
    return api.get('/vendedor/catalogo/categorias');
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