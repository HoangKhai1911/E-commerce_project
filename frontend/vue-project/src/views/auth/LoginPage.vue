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
    await authStore.login({ identifier: identifier.value, password: password.value });

    // 2. Hiển thị thông báo thành công
    notificationStore.show('Đăng nhập thành công!', 'success');

    // 3. Xử lý chuyển hướng thông minh
    const redirectPath = route.query.redirect as string | undefined;
    if (redirectPath) {
      router.replace(redirectPath);
    } else if (authStore.isAdmin) {
      // Nếu là admin, chuyển hướng đến trang Admin Dashboard
      router.replace({ name: 'AdminDashboard' });
    } else {
      // Nếu là người dùng thường, chuyển hướng về trang chủ
      router.replace({ name: 'Home' });
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

<style scoped>
.auth-card-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
  padding: 15px;
}
.auth-card {
  max-width: 500px;
  width: 100%;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.auth-title {
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem; /* Cỡ chữ tiêu đề */
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #212529;
}
.auth-form {
  font-family: 'Montserrat', sans-serif;
}
.auth-form :deep(.form-label) {
  font-weight: 600;
  color: #495057;
  font-size: 1.15rem; /* Tăng cỡ chữ của nhãn (label) */
  margin-bottom: 0.75rem;
}
.auth-form :deep(.form-control) {
  font-size: 1.15rem; /* Tăng cỡ chữ của ô input */
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid #ced4da;
}
.auth-form :deep(.form-control):focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25);
}
.auth-form :deep(.btn) {
  font-size: 1.2rem; /* Tăng cỡ chữ của nút bấm */
  font-weight: 700;
  padding: 1.1rem;
  border-radius: 12px;
  margin-top: 1.5rem;
}
p {
  /* font-family: 'Montserrat', sans-serif; */
  font-size: 1.2rem; /* Cỡ chữ của đoạn văn */
  color: #6c757d; /* Màu chữ nhạt hơn */
  font-weight: 500; /* Độ đậm chữ */
}
h2 {
  /* font-family: 'Montserrat', sans-serif; */
  font-size: 2.5rem; /* Cỡ chữ tiêu đề */
  font-weight: 700;
  color: #007bff; /* Màu chữ tối */
}
</style>