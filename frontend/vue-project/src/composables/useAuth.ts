import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useUiStore } from '@/store/ui';
import { useRouter } from 'vue-router';

export function useAuth() {
  const authStore = useAuthStore();
  const uiStore = useUiStore();
  const router = useRouter();

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Cung cấp các getters từ store dưới dạng computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const isAdmin = computed(() => authStore.isAdmin);

  const login = async (credentials: { identifier: string; password: string }) => {
    isLoading.value = true;
    error.value = null;
    try {
      await authStore.login(credentials);
      uiStore.addAlert('Đăng nhập thành công!', 'success');
      // authStore đã tự động chuyển hướng, không cần router.push ở đây
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Đăng nhập thất bại.';
      // Ném lỗi ra để component có thể xử lý thêm nếu cần
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (userInfo: { username: string; email: string; password: string }) => {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await authStore.register(userInfo);
      uiStore.addAlert(result.message || 'Đăng ký thành công. Vui lòng kiểm tra email.', 'success');
      router.push('/login');
    } catch (err: any) {
      error.value = err.response?.data?.error?.message || 'Đăng ký không thành công.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    authStore.logout();
    uiStore.addAlert('Bạn đã đăng xuất.', 'info');
  };

  return {
    isLoading,
    error,
    isAuthenticated,
    user,
    isAdmin,
    login,
    register,
    logout,
  };
}