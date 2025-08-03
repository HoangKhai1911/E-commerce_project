import { ref } from 'vue';
import { useUiStore } from '@/store/ui';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api'; // Import a configured axios instance

interface Category {
  id: number;
  name: string;
  slug: string;
}

export function useUserPreferences() {
  const uiStore = useUiStore();
  const authStore = useAuthStore();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const preferences = ref<Category[]>([]);

  const fetchPreferences = async () => {
    isLoading.value = true;
    error.value = null;
    try {
      // Giả sử API trả về cấu trúc { data: Category[] }
      // Nếu API trả về trực tiếp mảng Category[], hãy dùng:
      // const response = await api.get<Category[]>('/user-preferences');
      const response = await api.get<{ data: Category[] }>('/user-preferences');
      preferences.value = response.data.data; // Hoặc response.data tùy vào cấu trúc API
    } catch (err: any) {
      error.value = 'Không thể tải sở thích của bạn.';
      console.error('Lỗi khi tải sở thích người dùng:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const updatePreferences = async (interestIds: number[]) => {
    isLoading.value = true;
    error.value = null;
    try {
      await api.put('/user-preferences', { interests: interestIds });
      uiStore.addAlert('Cập nhật sở thích thành công!', 'success');
      // Làm mới thông tin người dùng trong store để phản ánh thay đổi
      await authStore.fetchUser();
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Cập nhật sở thích không thành công.';
      console.error('Lỗi khi cập nhật sở thích người dùng:', err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    isLoading,
    error,
    preferences,
    fetchPreferences,
    updatePreferences,
  };
}