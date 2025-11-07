import api from './api';
import { Pet, CreatePetData, UpdatePetData } from '../types';

export const petService = {
  getAll: (search?: string, animalType?: string) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (animalType) params.animal_type = animalType;
    return api.get<Pet[]>('/pets', { params });
  },

  getById: (id: number) => {
    return api.get<Pet>(`/pets/${id}`);
  },

  create: (data: CreatePetData) => {
    return api.post<Pet>('/pets', data);
  },

  update: (id: number, data: UpdatePetData) => {
    return api.patch<Pet>(`/pets/${id}`, data);
  },

  delete: (id: number) => {
    return api.delete(`/pets/${id}`);
  },
};

