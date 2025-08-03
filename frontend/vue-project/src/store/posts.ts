// src/stores/posts.ts
import { defineStore } from 'pinia';
import apiClient from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  point?: number;
}

// Định nghĩa các kiểu dữ liệu cho một bài viết để có type-safety
interface PostAuthor {
  id: number;
  name: string;
  avatar?: { url: string };
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: {
    url: string;
  };
  author: PostAuthor;
  category: Category;
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
        // Giả định endpoint trả về các bài viết mới nhất
        // Tham số 'populate' rất phổ biến trong Strapi để lấy dữ liệu liên quan
        const response = await apiClient.get<{ data: Post[] }>('/posts', {
          params: {
            sort: 'publishedAt:desc',
            'pagination[limit]': 6,
            'populate': ['coverImage', 'author', 'category'],
          },
        });
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
        // Giả định endpoint cho các đề xuất chưa được xác thực
        const response = await apiClient.get<{ data: Post[] }>('/recommendations/unauthenticated', {
           params: {
            'populate': ['coverImage', 'author', 'category'],
          }
        });
        this.recommendedPosts = response.data.data;
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
        // Giả định endpoint hoặc cách lọc để lấy danh mục nổi bật
        const response = await apiClient.get<{ data: Category[] }>('/categories', {
          params: {
            sort: 'point:desc', // Sắp xếp theo điểm (ví dụ)
            'pagination[limit]': 5,
          }
        });
        this.trendingCategories = response.data.data;
        this.status = 'success';
      } catch (err) {
        this.status = 'error';
        this.error = 'Không thể tải danh mục nổi bật.';
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
