import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools'; // Đảm bảo bạn có plugin này nếu đang sử dụng

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(), // Giữ lại nếu bạn đang sử dụng Vue DevTools
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: { // <-- THÊM KHỐI NÀY VÀO
    port: 5173, // Cổng frontend của bạn (thường là 5173 cho Vite)
    proxy: {
      // Proxy tất cả các yêu cầu bắt đầu bằng /api đến Strapi backend
      '/api': {
        target: 'http://localhost:1337', // Địa chỉ Strapi backend của bạn
        changeOrigin: true, // Thay đổi origin của request thành target host
        rewrite: (path) => path.replace(/^\/api/, ''), // Xóa tiền tố /api khỏi path trước khi gửi đến backend
      },
    },
  }, // <-- KẾT THÚC KHỐI NÀY
});
