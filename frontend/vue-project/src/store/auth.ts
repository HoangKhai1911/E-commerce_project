// src/stores/auth.ts
import { defineStore } from 'pinia';
import apiClient from '@/lib/api';
import router from '@/router';

interface Avatar {
  id: number;
  name: string;
  url: string;
}

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  avatar: Avatar | null;
  role?: Role;
  categories?: Array<{ id: number; name: string }>;
}

type AuthStatus = 'idle' | 'loading' | 'success' | 'error';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  error: string | null;
}

function getInitialState(): AuthState {
  return {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    status: 'idle',
    error: null,
  };
}

export const useAuthStore = defineStore('auth', {
  state: getInitialState,

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    isAdmin: (state) => state.user?.role?.name === 'Admin' || state.user?.role?.name === 'Super Admin',
  },

  actions: {
    async login(credentials: { identifier: string; password: string }) {
      this.status = 'loading';
      this.error = null;
      try {
        const response = await apiClient.post<{ accessToken: string; refreshToken: string; user: User }>('/auth/login', credentials);
        const { accessToken, refreshToken, user } = response.data;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        this.status = 'success';
        await router.push('/');
      } catch (err: any) {
        this.status = 'error';
        this.error =
          err.response?.data?.error?.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
        throw err;
      }
    },

    async register(userInfo: { username: string; email: string; password: string }) {
      this.status = 'loading';
      this.error = null;
      try {
        const response = await apiClient.post('/auth/register', userInfo);
        this.status = 'success';
        return response.data;
      } catch (err: any) {
        this.status = 'error';
        this.error =
          err.response?.data?.error?.message || 'Đăng ký không thành công.';
        throw err;
      }
    },

    logout() {
      this.user = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.status = 'idle';
      this.error = null;
      router.push('/login');
    },

    async fetchUser() {
      if (!this.accessToken) return;
      try {
        const response = await apiClient.get('/auth/me');
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        this.logout();
      }
    },

    setTokens({ accessToken, refreshToken }: { accessToken: string; refreshToken?: string }) {
      this.accessToken = accessToken;
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        this.refreshToken = refreshToken;
        localStorage.setItem('refreshToken', refreshToken);
      }
    },

    reset() {
      Object.assign(this, getInitialState());
    },
  },
});
