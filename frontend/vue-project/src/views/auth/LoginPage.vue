<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useNotificationStore } from '@/store/notification';
import { useRouter, useRoute } from 'vue-router';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const router = useRouter();
const route = useRoute();

const identifier = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

const handleLogin = async () => {
  errorMessage.value = null;
  isLoading.value = true;
  try {
    // 1. Gọi action login từ store
    await authStore.login(identifier.value, password.value);

    // 2. Hiển thị thông báo thành công
    notificationStore.show('Đăng nhập thành công!', 'success');

    // 3. Xử lý chuyển hướng thông minh
    const redirectPath = route.query.redirect as string | undefined;
    if (redirectPath) {
      router.replace(redirectPath); // Chuyển hướng về trang người dùng muốn
    } else {
      router.replace({ name: 'Home' }); // Mặc định về trang chủ
    }
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
    console.error('Login error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
    <div class="card shadow-lg p-4 p-md-5 auth-card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4 fw-bold">Đăng nhập</h2>
        <p class="text-center text-muted mb-4">Chào mừng bạn trở lại!</p>

        <BaseAlert v-if="errorMessage" :message="errorMessage" type="danger" class="mb-4" />

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <BaseInput
              id="identifier"
              label="Email hoặc Tên người dùng"
              type="text"
              v-model="identifier"
              placeholder="Nhập email hoặc tên người dùng của bạn"
              required
            />
          </div>
          <div class="mb-4">
            <BaseInput
              id="password"
              label="Mật khẩu"
              type="password"
              v-model="password"
              placeholder="Nhập mật khẩu của bạn"
              required
            />
          </div>
          <BaseButton type="submit" :loading="isLoading" class="w-100 btn-lg btn-primary">
            Đăng nhập
          </BaseButton>
        </form>

        <p class="text-center text-muted mt-4">
          Chưa có tài khoản?
          <RouterLink to="/auth/register" class="text-decoration-none fw-bold">Đăng ký ngay</RouterLink>
        </p>
        <p class="text-center mt-3">
            <RouterLink to="/auth/forgot-password" class="text-muted text-decoration-none">Quên mật khẩu?</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-card {
  max-width: 450px;
  width: 100%;
  border-radius: var(--bs-border-radius-lg); // Sử dụng biến đã định nghĩa
  background-color: var(--bs-white);
}

.card-title {
  color: var(--bs-primary);
}

.min-vh-75 {
  min-height: 75vh;
}
</style>