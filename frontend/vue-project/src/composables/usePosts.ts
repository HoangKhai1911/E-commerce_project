// src/composables/usePosts.ts
import api from '@/lib/api'; // Sử dụng instance đã được cấu hình với interceptor
import { useAuthStore } from '@/store/auth';

// Định nghĩa các kiểu dữ liệu để code rõ ràng hơn
interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  publishedAt: string;
  clickCount?: number;
  categories?: Array<{ id: number; name: string; slug: string }>;
  source?: { id: number; name: string };
  thumbnail_url?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export function usePosts() {
  const authStore = useAuthStore();

  /**
   * Lấy bài viết đề xuất (cá nhân hóa hoặc công khai)
   */
  const fetchRecommendedPosts = async (): Promise<Post[]> => {
    const endpoint = authStore.isAuthenticated
      ? '/recommendations/authenticated'
      : '/recommendations/unauthenticated';
    try {
      const response = await api.get<Post[]>(endpoint);
      return response.data;
    } catch (err: any) {
      console.error(`Error fetching recommended posts from ${endpoint}:`, err);
      throw err; // Ném lỗi ra để Promise.all có thể bắt được
    }
  };

  /**
   * Lấy các bài viết mới nhất (có phân trang)
   */
  const fetchLatestPosts = async (page = 1, pageSize = 6): Promise<PaginatedResponse<Post>> => {
    try {
      // Tận dụng endpoint search, khi không có query `q` nó sẽ trả về bài viết mới nhất
      const response = await api.get<PaginatedResponse<Post>>('/recommendations/search', {
        params: { 'pagination[page]': page, 'pagination[pageSize]': pageSize },
      });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching latest posts:', err);
      throw err;
    }
  };

  // Các hàm khác bạn đã dùng ở các trang khác, tập trung vào đây
  const getPostBySlug = async (slug: string): Promise<Post> => {
    // Giả sử API trả về cấu trúc { data: Post }
    const response = await api.get<{ data: Post }>(`/posts/${slug}?populate=*`);
    return response.data.data;
  };

  const getRelatedPosts = async (postId: number): Promise<Post[]> => {
    const response = await api.get<Post[]>(`/recommendations/related/${postId}`);
    return response.data;
  };

  return {
    fetchRecommendedPosts,
    fetchLatestPosts,
    getPostBySlug,
    getRelatedPosts,
  };
}