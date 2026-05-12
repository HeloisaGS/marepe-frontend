import api from './api';
 
export const profileService = {
  getMeuPerfil: () => api.get('/profile/my-profile'),
};