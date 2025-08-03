import api from '@/lib/api';
import type { User, Category } from '@/type';

export const userService = {
  getMe: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateMe: async (data: Partial<User>): Promise<{ message: string }> => {
    const response = await api.put('/user/me', data);
    return response.data;
  },

  deleteMe: async (): Promise<{ message: string }> => {
    const response = await api.delete('/user/me');
    return response.data;
  },

  getPreferences: async (): Promise<{ data: Category[] }> => {
    const response = await api.get('/user-preferences');
    return response.data;
  },

  updatePreferences: async (interestIds: number[]): Promise<{ message: string }> => {
    const response = await api.put('/user-preferences', { interests: interestIds });
    return response.data;
  },
};