import api from './api';

export const profileService = {
  getMeuPerfil: () => api.get('/profile/my-profile'),

  atualizarPerfil: (data: {
    nome?: string;
    telefone?: string;
    nome_barraca?: string;
    foto?: any;
  }) => {
    const formData = new FormData();

    if (data.nome) formData.append('nome', data.nome);
    if (data.telefone) formData.append('telefone', data.telefone);
    if (data.nome_barraca) formData.append('nome_barraca', data.nome_barraca);
    if (data.foto) {
      formData.append('foto', {
        uri: data.foto.uri,
        type: data.foto.type || 'image/jpeg',
        name: data.foto.name || 'photo.jpg',
      } as any);
    }

    return api.put('/profile/my-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
