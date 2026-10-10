import api from './api';

export const plantService = {
  getPlants: async (params) => {
    const response = await api.get('/plants', { params });
    return response.data;
  },
  
  getPlantById: async (id) => {
    const response = await api.get(`/plants/${id}`);
    return response.data;
  },
  
  getCategories: async () => {
    // For now we might return mock categories or fetch from backend if endpoint exists
    return ['All', 'Indoor', 'Outdoor', 'Succulents', 'Ferns', 'Cacti'];
  }
};
