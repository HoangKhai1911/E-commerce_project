import { defineStore } from 'pinia';
import apiClient from '@/lib/api';

// Định nghĩa kiểu dữ liệu cho User để tái sử dụng
interface User {
  id: number;
  username: string;
  email: string;
  isAdmin?: boolean;
  avatar?: { url: string } | null;
  // Thêm các thuộc tính khác của user nếu cần
}

// Định nghĩa kiểu dữ liệu cho State của store
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null; // Token dùng để làm mới
}

export const useAuthStore = defineStore('auth', {
  // State: Lấy dữ liệu từ localStorage khi khởi tạo
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
  }),

  // Getters: Các computed properties từ state
  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    isAdmin: (state) => state.user?.isAdmin === true,
  },

  // Actions: Các hàm để thay đổi state
  actions: {
    /**
     * Xử lý đăng ký người dùng mới.
     * @returns Promise<{ message: string }> - Thông báo từ backend.
     */
    async register(userInfo: { username: string; email: string; password: string }): Promise<{ message: string }> {
      // API đăng ký không trả về JWT, chỉ trả về một thông báo.
      const { data } = await apiClient.post('/auth/register', userInfo);
      return data;
    },

    /**
     * Xử lý đăng nhập, lưu thông tin vào state và localStorage.
     */
    async login(credentials: { identifier: string; password: string }) {
      const { data } = await apiClient.post('/auth/login', credentials);
      this.user = data.user;
      this.accessToken = data.jwt;
      this.refreshToken = data.refreshToken;

      // Lưu vào localStorage để duy trì trạng thái đăng nhập
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('accessToken', data.jwt);
      localStorage.setItem('refreshToken', data.refreshToken);
    },

    /**
     * Xử lý đăng xuất, xóa thông tin khỏi state và localStorage.
     */
    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Chuyển hướng về trang đăng nhập (cách đơn giản nhất)
      window.location.href = '/auth/login';
    },

    /**
     * Lấy thông tin người dùng hiện tại từ API và cập nhật store.
     * Hữu ích sau khi cập nhật thông tin cá nhân hoặc sở thích.
     */
    async fetchUser() {
      if (this.accessToken) {
        try {
          const { data } = await apiClient.get<User>('/auth/me');
          this.user = data;
          localStorage.setItem('user', JSON.stringify(data));
        } catch (error) {
          console.error('Không thể làm mới thông tin người dùng:', error);
          this.logout(); // Đăng xuất nếu không thể lấy thông tin người dùng (ví dụ: token hết hạn)
        }
      }
    },

    /**
     * Làm mới access token bằng refresh token.
     * @returns Promise<string> - Access token mới.
     */
    async refreshAccessToken(): Promise<string> {
      if (!this.refreshToken) {
        this.logout();
        return Promise.reject(new Error('No refresh token available.'));
      }
      
      const { data } = await apiClient.post('/auth/refresh-token', {
        refreshToken: this.refreshToken,
      });

      this.accessToken = data.jwt;
      localStorage.setItem('accessToken', data.jwt);
      return data.jwt;
    },
  },
});
