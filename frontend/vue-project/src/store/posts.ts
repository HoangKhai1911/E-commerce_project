// src/stores/posts.ts
import { defineStore } from 'pinia';
import apiClient from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  postCount?: number; // Cập nhật để khớp với dữ liệu trả về từ backend
}

// Định nghĩa các kiểu dữ liệu cho một bài viết để có type-safety
interface PostAuthor {
  id: number;
  username: string;
  avatar?: { url: string };
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  image?: {
    url: string;
  }[];
  author: PostAuthor;
  categories: Category[];
  publishedAt: string;
}

type PostsStatus = 'idle' | 'loading' | 'success' | 'error';

interface PostsState {
  categories: Category[];
  latestPosts: Post[];
  recommendedPosts: Post[];
  trendingCategories: Category[];
  status: PostsStatus;
  error: string | null;
}

function getInitialState(): PostsState {
  return {
    categories: [],
    latestPosts: [],
    recommendedPosts: [],
    trendingCategories: [],
    status: 'idle',
    error: null,
  };
}

export const usePostsStore = defineStore('posts', {
  state: getInitialState,

  actions: {
    /**
     * Lấy và lưu trữ danh sách tất cả các danh mục.
     * Chỉ gọi API nếu danh sách chưa có trong store.
     */
    async fetchCategories(force = false) {
      // Nếu đã có dữ liệu và không yêu cầu làm mới, thoát hàm
      if (this.categories.length > 0 && !force) return;

      this.status = 'loading';
      this.error = null;

      try {
        // Strapi v4 thường trả về dữ liệu trong thuộc tính 'data'
        const response = await apiClient.get<{ data: Category[] }>('/categories');
        this.categories = response.data.data;
        this.status = 'success';
      } catch (err: any) {
        this.status = 'error';
        this.error = 'Không thể tải danh sách danh mục.';
        console.error(err);
        throw err;
      }
    },

    async fetchLatestPosts() {
      this.status = 'loading';
      try {
        // SỬA LỖI: Gọi API search mà không có query để lấy bài viết mới nhất
        // Backend đã populate sẵn các trường cần thiết
        const response = await apiClient.get<{ data: Post[] }>('/recommendations/search', {
          params: { pageSize: 6 }
        });
        // API search trả về cấu trúc { data: [...], meta: {...} }
        this.latestPosts = response.data.data;
        this.status = 'success';
      } catch (err) {
        this.status = 'error';
        this.error = 'Không thể tải bài viết mới nhất.';
        console.error(err);
        throw err;
      }
    },

    async fetchRecommendedPosts() {
      this.status = 'loading';
      try {
        // SỬA LỖI: Gọi đúng API đề xuất cho người dùng chưa đăng nhập
        // Backend đã populate sẵn, không cần params ở đây
        const response = await apiClient.get<Post[]>('/recommendations/unauthenticated', {
           params: {}
        });
        this.recommendedPosts = response.data;
        this.status = 'success';
      } catch (err) {
        this.status = 'error';
        this.error = 'Không thể tải bài viết đề xuất.';
        console.error(err);
        throw err;
      }
    },

    async fetchTrendingCategories() {
      this.status = 'loading';
      try {
        // SỬA LỖI: Gọi đúng API để lấy danh mục nổi bật
        const response = await apiClient.get<Category[]>('/recommendations/trending-categories');
        this.trendingCategories = response.data;
        this.status = 'success';
      } catch (err) {
        this.status = 'error';
        this.error = 'Không thể tải danh mục nổi bật.';
        console.error(err);
        throw err;
      }
    },

    /**
     * Lấy thông tin của một danh mục bằng slug.
     * @param slug - Slug của danh mục.
     */
    async fetchCategoryBySlug(slug: string): Promise<Category | null> {
      this.status = 'loading';
      try {
        const response = await apiClient.get<Category>(`/recommendations/category-info/${slug}`);
        this.status = 'success';
        return response.data;
      } catch (err) {
        this.status = 'error';
        this.error = `Không thể tải thông tin danh mục: ${slug}`;
        console.error(err);
        return null;
      }
    },

    /**
     * Lấy danh sách bài viết thuộc một danh mục.
     * @param slug - Slug của danh mục.
     * @param page - Số trang.
     * @param pageSize - Số lượng bài viết mỗi trang.
     */
    async fetchPostsByCategory(slug: string, page = 1, pageSize = 9) {
      this.status = 'loading';
      try {
        const response = await apiClient.get<{ data: Post[], meta: any }>('/recommendations/search', {
          params: {
            category: slug,
            page,
            pageSize,
          },
        });
        this.status = 'success';
        return response.data; // Trả về cả data và meta cho component xử lý phân trang
      } catch (err) {
        this.status = 'error';
        this.error = `Không thể tải bài viết cho danh mục: ${slug}`;
        console.error(err);
        throw err;
      }
    },
    /**
     * Đặt lại trạng thái của store về giá trị ban đầu.
     */
    reset() {
      Object.assign(this, getInitialState());
    },
  },
});
