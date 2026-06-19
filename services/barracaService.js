import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './axiosApi'; 

export const barracaService = {
  
  registrarBarraca: async (latitude, longitude, establishmentPhotos = [], menuPhotos = []) => {
    const token = await AsyncStorage.getItem('userToken');

    const formData = new FormData();
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    
    if (establishmentPhotos && establishmentPhotos.length > 0) {
      establishmentPhotos.forEach(photo => {
        formData.append('establishment_photos', photo);
      });
    }

    if (menuPhotos && menuPhotos.length > 0) {
      menuPhotos.forEach(photo => {
        formData.append('menu_photos', photo);
      });
    }

    const response = await fetch('https://marepe-backend.onrender.com/barraca/register-stand', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('🚨 Erro detalhado vindo do Fetch:', errorData);
      throw new Error(errorData.detail || 'Erro ao salvar dados no servidor');
    }

    const data = await response.json();

    await AsyncStorage.setItem(
      '@local_stand_coords',
      JSON.stringify({ latitude: Number(latitude), longitude: Number(longitude) })
    );

    return data;
  },

  obterDetalhesBarraca: async (vendorId) => {
    const response = await api.get(`/barraca/${vendorId}`);
    
    const cachedCoords = await AsyncStorage.getItem('@local_stand_coords');
    
    if (cachedCoords && response.data) {
      const parsed = JSON.parse(cachedCoords);
      response.data.latitude = parsed.latitude;
      response.data.longitude = parsed.longitude;
    }

    return response;
  },

  listarClientesAssociados: async () => {
    return api.get('/barraca/my-associations');
  },

  listarTodasBarracas: async () => {
    return api.get('/barraca/get-all-stands');
  },
};