import api from './api';
import { MedicalRecord, CreateRecordData, UpdateRecordData } from '../types';

export const recordService = {
  getByPetId: (petId: number) => {
    return api.get<MedicalRecord[]>(`/records/pet/${petId}`);
  },

  getById: (id: number) => {
    return api.get<MedicalRecord>(`/records/${id}`);
  },

  create: (petId: number, data: CreateRecordData) => {
    return api.post<MedicalRecord>(`/records/pet/${petId}`, data);
  },

  update: (id: number, data: UpdateRecordData) => {
    return api.patch<MedicalRecord>(`/records/${id}`, data);
  },

  delete: (id: number) => {
    return api.delete(`/records/${id}`);
  },
};

