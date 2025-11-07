import api from './api';

export const petService = {
  getAll: (search, animalType) => {
    const params = {};
    if (search) params.search = search;
    if (animalType) params.animal_type = animalType;
    return api.get('/pets', { params });
  },

  getById: (id) => {
    return api.get(`/pets/${id}`);
  },

  create: (data) => {
    return api.post('/pets', data);
  },

  update: (id, data) => {
    return api.patch(`/pets/${id}`, data);
  },

  delete: (id) => {
    return api.delete(`/pets/${id}`);
  },
};

