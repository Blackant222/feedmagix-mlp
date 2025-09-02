import { apiClient } from './api';
import { Pet } from '../types';

export const petService = {
  async getUserPets(): Promise<Pet[]> {
    return apiClient.request<Pet[]>('/api/pets');
  },

  async createPet(petData: Omit<Pet, 'id'>): Promise<Pet> {
    return apiClient.request<Pet>('/api/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  },

  async updatePet(petId: string, petData: Partial<Pet>): Promise<Pet> {
    return apiClient.request<Pet>(`/api/pets/${petId}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  },

  async deletePet(petId: string): Promise<void> {
    return apiClient.request<void>(`/api/pets/${petId}`, {
      method: 'DELETE',
    });
  },

  async getPetById(petId: string): Promise<Pet> {
    return apiClient.request<Pet>(`/api/pets/${petId}`);
  }
};