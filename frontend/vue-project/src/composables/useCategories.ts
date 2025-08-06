// src/composables/useCategories.ts
import { ref } from 'vue';
import api from '@/lib/api'; // Sử dụng instance đã được cấu hình với interceptor

interface Category {
  id: number;
  name: string;
  slug: string;
  point?: number; // Thêm trường point cho danh mục trending
  posts?: Array<{ id: number; title: string; slug: string }>; // Thêm posts cho allCategories
}

export function useCategories() {
  // State cho tất cả danh mục
  const allCategories = ref<Category[]>([]);
  const allCategoriesLoading = ref(false);
  const allCategoriesError = ref<string | null>(null);

  // State cho danh mục thịnh hành
  const trendingCategories = ref<Category[]>([]);
  const trendingCategoriesLoading = ref(false);
  const trendingCategoriesError = ref<string | null>(null);

  /**
   * Tải tất cả danh mục.
   */
  const fetchAllCategories = async () => {
    allCategoriesLoading.value = true;
    allCategoriesError.value = null;
    try {
      const response = await api.get('/categories', {
        params: {
          populate: { // Đảm bảo populate posts để lấy số lượng bài viết
            posts: {
              fields: ['id'] // Chỉ cần ID để đếm số lượng
            }
          }
        }
      });
      // Ánh xạ dữ liệu từ Strapi API response
      allCategories.value = response.data.data.map((item: any) => ({
        id: item.id,
        name: item.attributes.name,
        slug: item.attributes.slug,
        // 🔴 SỬA LỖI Ở ĐÂY: Truy cập trực tiếp item.attributes.posts
        posts: item.attributes.posts || [] // Nếu posts là null/undefined, mặc định là mảng rỗng
      }));
    } catch (err: any) {
      console.error('Error fetching all categories:', err);
      allCategoriesError.value = err.message;
    } finally {
      allCategoriesLoading.value = false;
    }
  };

  /**
   * Tải các danh mục thịnh hành từ endpoint recommendations.
   */
  const fetchTrendingCategories = async () => {
    trendingCategoriesLoading.value = true;
    trendingCategoriesError.value = null;
    try {
      const response = await api.get('/recommendations/trending-categories');
      // Dữ liệu từ trending-categories đã được xử lý ở backend, chỉ cần gán trực tiếp
      trendingCategories.value = response.data; 
    } catch (err: any) {
      console.error('Error fetching trending categories:', err);
      trendingCategoriesError.value = err.message;
    } finally {
      trendingCategoriesLoading.value = false;
    }
  };

  return {
    allCategories,
    allCategoriesLoading,
    allCategoriesError,
    fetchAllCategories,
    trendingCategories,
    trendingCategoriesLoading,
    trendingCategoriesError,
    fetchTrendingCategories
  };
}
