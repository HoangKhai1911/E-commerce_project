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
  source?: { id: number; name: string; url?: string }; // Thêm url vào source
  thumbnail?: { url: string }; // Thay đổi thumbnail_url thành thumbnail và url
  author?: { username: string; avatar?: { url: string } }; // Thêm author và avatar
  excerpt?: string; // Thêm excerpt
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

  /**
   * Lấy một bài viết bằng slug từ backend.
   * Sửa URL để khớp với route backend: /api/posts/:slug
   * Sử dụng `api.get` để tận dụng cấu hình axios.
   */
  const getPostBySlug = async (slug: string): Promise<Post> => {
    try {
      // Sửa URL: bỏ tiền tố `/by-slug` để khớp với route backend `/posts/:id` (nơi :id có thể là slug)
      const response = await api.get<Post>(`/posts/${slug}`, {
        params: { populate: '*' } // Truyền populate như một query param
      });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching post by slug:', err);
      throw err;
    }
  };

  /**
   * Lấy các bài viết liên quan dựa trên ID của bài viết hiện tại.
   * (Giữ nguyên như đã có trong recommendation controller)
   */
  const getRelatedPosts = async (postId: number): Promise<Post[]> => {
    try {
      const response = await api.get<Post[]>(`/recommendations/related/${postId}`, {
        params: { populate: '*' } // Đảm bảo populate các trường cần thiết
      });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching related posts:', err);
      throw err;
    }
  };


  return {
    fetchRecommendedPosts,
    fetchLatestPosts,
    getPostBySlug,
    getRelatedPosts,
  };
}
