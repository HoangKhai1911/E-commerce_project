<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const authStore = useAuthStore();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isLoading = ref(false);

const handleRegister = async () => {
  errorMessage.value = null;
  successMessage.value = null;
  isLoading.value = true;

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.';
    isLoading.value = false;
    return;
  }

  try {
    await authStore.register({ username: username.value, email: email.value, password: password.value });
    successMessage.value = 'Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập sau 3 giây. Vui lòng kiểm tra email để xác minh tài khoản.';
    username.value = '';
    email.value = '';
    password.value = '';
    confirmPassword.value = '';
    // Tự động chuyển hướng đến trang đăng nhập sau 3 giây
    setTimeout(() => router.push({ name: 'Login' }), 3000);
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
    console.error('Register error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
    <div class="card shadow-lg p-4 p-md-5 auth-card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4 fw-bold">Đăng ký</h2>
        <p class="text-center text-muted mb-4">Hãy tham gia cùng chúng tôi!</p>

        <BaseAlert v-if="errorMessage" :message="errorMessage" type="danger" class="mb-4" />
        <BaseAlert v-if="successMessage" :message="successMessage" type="success" class="mb-4" />

        <form @submit.prevent="handleRegister">
          <div class="mb-3">
            <BaseInput
              id="reg-username"
              label="Tên người dùng"
              type="text"
              v-model="username"
              placeholder="Nhập tên người dùng của bạn"
              required
            />
          </div>
          <div class="mb-3">
            <BaseInput
              id="reg-email"
              label="Email"
              type="email"
              v-model="email"
              placeholder="Nhập địa chỉ email của bạn"
              required
            />
          </div>
          <div class="mb-3">
            <BaseInput
              id="reg-password"
              label="Mật khẩu"
              type="password"
              v-model="password"
              placeholder="Tạo mật khẩu mạnh"
              required
            />
          </div>
          <div class="mb-4">
            <BaseInput
              id="reg-confirm-password"
              label="Xác nhận mật khẩu"
              type="password"
              v-model="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>
          <BaseButton type="submit" :loading="isLoading" class="w-100 btn-lg btn-primary">
            Đăng ký
          </BaseButton>
        </form>

        <p class="text-center text-muted mt-4">
          Đã có tài khoản?
          <RouterLink to="/auth/login" class="text-decoration-none fw-bold">Đăng nhập</RouterLink>
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
  padding: 20px;
}
.auth-card {
  max-width: 500px;
  width: 100%;
  padding: 40px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
.auth-title {
  font-family: 'Poppins', sans-serif;
  font-size: 2.5rem; /* Cỡ chữ tiêu đề */
  font-weight: 700;
  text-align: center;
  margin-bottom: 1.5rem;
  color: #212529;
}
.auth-form {
  font-family: 'Poppins', sans-serif;
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