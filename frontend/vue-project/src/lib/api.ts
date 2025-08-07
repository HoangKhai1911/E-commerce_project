import axios from 'axios';
import { useAuthStore } from '@/store/auth'; // Import auth store
import { useNotificationStore } from '@/store/notification';

interface FailedRequest {
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}

// Biến để theo dõi yêu cầu làm mới token
let isRefreshing = false;
// Hàng đợi các yêu cầu bị lỗi 401
let failedQueue: FailedRequest[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho REQUEST: Tự động đính kèm access token
apiClient.interceptors.request.use(
  config => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
      // Đính kèm access token vào mỗi request
      config.headers['Authorization'] = `Bearer ${authStore.accessToken}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor cho RESPONSE: Xử lý token hết hạn
apiClient.interceptors.response.use(
  response => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;
    const authStore = useAuthStore();

    // Nếu lỗi là 401, không phải là yêu cầu retry, và không phải là chính request refresh-token
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/refresh-token') {
      // Nếu không có refresh token, đăng xuất người dùng và dừng lại.
      if (!authStore.refreshToken) {
        // Chỉ gọi logout nếu người dùng đã từng đăng nhập
        if (authStore.isAuthenticated) {
          const notificationStore = useNotificationStore();
          notificationStore.show('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'danger');
          authStore.logout();
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Nếu đang có một yêu cầu refresh khác, thêm yêu cầu hiện tại vào hàng đợi
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi action refreshToken từ store. Lỗi TS của bạn sẽ được giải quyết ở đây.
        const newAccessToken = await authStore.refreshAccessToken();
        processQueue(null, newAccessToken);
        // Sau khi có token mới, thực
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        authStore.logout(); // Nếu refresh thất bại, đăng xuất người dùng
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;