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
    await authStore.login({ identifier: identifier.value, password: password.value });

    notificationStore.show('Đăng nhập thành công!', 'success');

    const redirectPath = route.query.redirect as string | undefined;

    if (redirectPath) {
      router.replace(redirectPath);
    } else if (authStore.isAdmin) {
      router.replace({ name: 'AdminDashboard' });
    } else {
      router.replace({ name: 'Home' });
    }
  } catch (err: any) {
    errorMessage.value =
      err.response?.data?.error?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
    console.error('Login error:', err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container min-vh-100 d-flex justify-content-center align-items-center">
    <div class="card shadow-sm p-4 auth-card">
      <div class="card-body">
        <h2 class="card-title text-center mb-3 fw-bold">ĐĂNG NHẬP</h2>

        <BaseAlert v-if="errorMessage" :message="errorMessage" type="danger" class="mb-3" />

        <form @submit.prevent="handleLogin">
          <div class="mb-2">
            <BaseInput
              id="identifier"
              label="Email hoặc Tên người dùng"
              type="text"
              v-model="identifier"
              placeholder="Nhập email hoặc tên người dùng"
              required
            />
          </div>
          <div class="mb-2">
            <BaseInput
              id="password"
              label="Mật khẩu"
              type="password"
              v-model="password"
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          <BaseButton type="submit" :loading="isLoading" class="w-100 btn-sm btn-primary">
            Đăng nhập
          </BaseButton>
        </form>

        <p class="text-center text-muted mt-3 mb-1">
          Chưa có tài khoản?
          <RouterLink to="/auth/register" class="text-decoration-none fw-semibold">Đăng ký ngay</RouterLink>
        </p>
        <p class="text-center mb-0">
          <RouterLink to="/auth/forgot-password" class="text-muted text-decoration-none">Quên mật khẩu?</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  max-width: 400px;
  width: 100%;
  border-radius: 12px;
  background-color: #fff;
}

.card-title {
  color: var(--bs-primary);
}
</style>