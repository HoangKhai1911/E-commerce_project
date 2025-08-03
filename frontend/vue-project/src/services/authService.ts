import api from '@/lib/api';
import type { User } from '@/type';

interface LoginResponse {
  jwt: string;
  user: User;
}

interface RegisterResponse {
  message: string;
}

export const authService = {
  login: async (credentials: { identifier: string; password: string }): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userInfo: { username: string; email: string; password: string }): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', userInfo);
    return response.data;
  },
};