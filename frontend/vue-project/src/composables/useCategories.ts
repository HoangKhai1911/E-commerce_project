// src/composables/useCategories.ts
import { useApi } from './useApi';
import api from '@/lib/api'; // Sử dụng instance đã được cấu hình với interceptor

interface Category {
  id: number;
  name: string;
  slug: string;
  point?: number; // Thêm trường point cho danh mục trending
}

export function useCategories() {
  // Truyền một hàm gọi API chung cho useApi.
  // Chúng ta sẽ cung cấp URL cụ thể khi gọi `execute`.
  const { data, isLoading, error, execute } = useApi<Category[]>(
    (url: string) => api.get(url),
    { immediate: false } // Không gọi API ngay lập tức
  );

  /**
   * Tải tất cả danh mục và cập nhật state dùng chung (data, isLoading, error).
   */
  const fetchAllCategories = () => {
    // `execute` sẽ gọi `axios.get('/categories')`
    return execute('/categories');
  };

  /**
   * Tải các danh mục thịnh hành và cập nhật state dùng chung.
   */
  const fetchTrendingCategories = () => {
    // `execute` sẽ gọi `axios.get('/categories/trending')`
    return execute('/categories/trending');
  };

  return { data, isLoading, error, fetchAllCategories, fetchTrendingCategories };
}