import api from '@/lib/api';
import type { Category, TrendingCategory } from '@/type';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getTrending: async (): Promise<TrendingCategory[]> => {
    const response = await api.get('/categories/trending');
    return response.data;
  },
};
