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

<style lang="scss" scoped>
.auth-card {
  max-width: 450px;
  width: 100%;
  border-radius: var(--bs-border-radius-lg);
  background-color: var(--bs-white);
}

.card-title {
  color: var(--bs-primary);
}

.min-vh-75 {
  min-height: 75vh;
}
</style>