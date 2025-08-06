import axios from 'axios';

const apiClient = axios.create({
  // ĐÂY LÀ ĐIỂM QUAN TRỌNG NHẤT:
  // Luôn chỉ định URL đầy đủ của backend Strapi.
  // Nếu không, axios sẽ gửi yêu cầu đến domain của frontend (localhost:5173),
  // gây ra lỗi bạn đang thấy.
  baseURL: 'http://localhost:1337/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm một interceptor để tự động đính kèm token xác thực vào mỗi yêu cầu
// nếu người dùng đã đăng nhập.
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('strapi_jwt'); // Giả sử bạn lưu token với key này
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;