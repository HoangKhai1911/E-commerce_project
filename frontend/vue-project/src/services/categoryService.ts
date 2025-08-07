import api from '@/lib/api';
import type { Category, TrendingCategory } from '@/type';

// Thêm một interface để định nghĩa các tham số truy vấn có thể có, giúp code an toàn và dễ đọc hơn.
interface GetAllCategoriesParams {
  fields?: string[];
  sort?: string | string[];
  pagination?: {
    limit?: number;
    start?: number;
    page?: number;
    pageSize?: number;
  };
  // Cho phép các tham số khác
  [key: string]: any;
}

export const categoryService = {
  /**
   * Lấy danh sách danh mục với các tham số truy vấn tùy chọn.
   * @param params - Đối tượng chứa các tham số truy vấn như fields, sort, pagination.
   */
  getAll: async (params?: GetAllCategoriesParams): Promise<Category[]> => {
    const response = await api.get('/categories', { params });

    // Strapi v4 gói mảng trong thuộc tính 'data'.
    // Ta cần trích xuất nó và ánh xạ các thuộc tính.
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data.map((item: any) => ({
        id: item.id,
        ...item.attributes,
      }));
    }
    return []; // Trả về mảng rỗng nếu cấu trúc không như mong đợi
  },

  getTrending: async (): Promise<TrendingCategory[]> => {
    // Sửa lỗi: Endpoint đúng là '/recommendations/trending-categories' theo file routes/recommendation.js
    const response = await api.get('/recommendations/trending-categories');
    return response.data;
  },
};
