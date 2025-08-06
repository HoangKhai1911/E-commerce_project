import api from '@/lib/api';

export interface PostSuggestion {
  id: number;
  title: string;
  slug: string;
}

export const suggestPosts = async (query: string): Promise<PostSuggestion[]> => {
  try {
    const response = await api.get<PostSuggestion[]>('/recommendations/suggestions', {
      params: { q: query },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return []; // Trả về một mảng rỗng khi có lỗi
  }
};