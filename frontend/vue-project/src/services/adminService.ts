import api from '@/lib/api';
import type { Category, Source } from '@/type';

// A payload for creating a category
type CreateCategoryPayload = Pick<Category, 'name'>;
// A payload for updating a category
type UpdateCategoryPayload = Partial<CreateCategoryPayload>;

// A payload for creating a source
type CreateSourcePayload = Omit<Source, 'id'>;
// A payload for updating a source
type UpdateSourcePayload = Partial<CreateSourcePayload>;

export const adminService = {
  // == Category Management ==
  createCategory: (data: CreateCategoryPayload) => {
    return api.post<Category>('/categories', data);
  },
  updateCategory: (id: number, data: UpdateCategoryPayload) => {
    return api.put<Category>(`/categories/${id}`, data);
  },
  deleteCategory: (id: number) => {
    return api.delete(`/categories/${id}`);
  },

  // == Source Management ==
  findSources: async (): Promise<Source[]> => {
    const response = await api.get<Source[]>('/sources');
    return response.data;
  },
  createSource: (data: CreateSourcePayload) => {
    return api.post<Source>('/sources', data);
  },
  updateSource: (id: number, data: UpdateSourcePayload) => {
    return api.put<Source>(`/sources/${id}`, data);
  },
  deleteSource: (id: number) => {
    return api.delete(`/sources/${id}`);
  },

  // == Post Management ==
  deletePost: (id: number) => {
    return api.delete(`/posts/${id}`);
  },

  // == User Management ==
  // This is just a guess based on the error message, might not be used anywhere yet.
  deleteUserByAdmin: (id: number) => {
    return api.delete(`/users/${id}`);
  },
};