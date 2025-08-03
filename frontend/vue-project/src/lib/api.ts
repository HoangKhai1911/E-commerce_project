import axios from 'axios';
import { useAuthStore } from '@/store/auth'; // Sửa lại đường dẫn nếu cần
import router from '@/router'; // Import router để thực hiện chuyển hướng

// Lấy URL của API từ biến môi trường, hoặc dùng giá trị mặc định cho local dev
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:1337/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Axios Request Interceptor
 *
 * Interceptor này sẽ được thực thi TRƯỚC KHI mỗi request được gửi đi.
 * Nhiệm vụ của nó là lấy JWT token từ Pinia store và đính kèm vào header 'Authorization'.
 */
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.accessToken;

    if (token) {
      // Nếu có token, thêm vào header dưới dạng Bearer token
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

let isRefreshing = false;

// Định nghĩa kiểu cho các promise trong hàng đợi
type FailedQueuePromise = {
  resolve: (token: string) => void;
  reject: (error?: any) => void;
};

let failedQueue: FailedQueuePromise[] = [];

/**
 * Axios Response Interceptor
 *
 * Interceptor này sẽ được thực thi SAU KHI nhận được phản hồi từ server.
 * Nhiệm vụ của nó là kiểm tra các lỗi, đặc biệt là lỗi 401 Unauthorized.
 */
api.interceptors.response.use(
  // Hàm này sẽ được gọi với các response thành công (status code 2xx)
  (response) => {
    // Không làm gì cả, chỉ trả về response
    return response;
  },
  // Hàm này sẽ được gọi khi có lỗi (status code không phải 2xx)
  async (error) => {
    const authStore = useAuthStore();
    const originalRequest = error.config;

    // Nếu lỗi là 401 và request này chưa được thử lại
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang có một request làm mới token, đẩy request lỗi vào hàng đợi
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject})
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh-token', {
          refreshToken: authStore.refreshToken,
        });

        // Cập nhật lại store với token mới bằng action đã tạo
        authStore.setTokens(data);

        // Cập nhật header cho request hiện tại và thực hiện lại nó
        api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;

        // Thực hiện lại các request trong hàng đợi
        failedQueue.forEach(prom => prom.resolve(data.accessToken));
        failedQueue = [];

        return api(originalRequest);
      } catch (refreshError) {
        // Nếu làm mới token thất bại, đăng xuất người dùng
        authStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Rất quan trọng: Trả về lỗi để các hàm .catch() ở component có thể xử lý tiếp
    return Promise.reject(error);
  }
);

export default api;
