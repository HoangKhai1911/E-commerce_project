import api from '@/lib/api';
import type { PaginatedResponse, Post } from '@/type';

export const postService = {
  getRecommended: async (isAuthenticated: boolean): Promise<Post[]> => {
    const endpoint = isAuthenticated ? '/recommendations/authenticated' : '/recommendations/unauthenticated';
    const response = await api.get(endpoint);
    return response.data;
  },

  getPostBySlug: async (slug: string): Promise<Post> => {
    const response = await api.get(`/posts/${slug}`);
    return response.data;
  },

  getPostsByCategory: async (slug: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Post>> => {
    const response = await api.get(`/categories/${slug}/posts`, {
      params: { page, pageSize },
    });
    return response.data;
  },

  getRelatedPosts: async (postId: number): Promise<Post[]> => {
    const response = await api.get(`/recommendations/related/${postId}`);
    return response.data;
  },

  searchPosts: async (query: string, page = 1, pageSize = 10): Promise<PaginatedResponse<Post>> => {
    const response = await api.get('/recommendations/search', {
      params: { q: query, page, pageSize },
    });
    return response.data;
  },
};
