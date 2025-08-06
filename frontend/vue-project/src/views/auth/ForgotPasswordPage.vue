<script setup lang="ts">
import { ref } from 'vue';
import { useNotificationStore } from '@/store/notification';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const notificationStore = useNotificationStore();
const email = ref('');
const successMessage = ref<string | null>(null);
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

const handleForgotPassword = async () => {
  isLoading.value = true;
  errorMessage.value = null;
  successMessage.value = null;

  try {
    // TODO: Gọi API backend để xử lý quên mật khẩu
    // Ví dụ: await apiClient.post('/auth/forgot-password', { email: email.value });

    // Giả lập thành công để hiển thị UI
    console.log('Yêu cầu quên mật khẩu cho email:', email.value);
    await new Promise(resolve => setTimeout(resolve, 1000));

    successMessage.value = `Nếu email ${email.value} tồn tại trong hệ thống, bạn sẽ nhận được một liên kết để đặt lại mật khẩu.`;
    notificationStore.show('Yêu cầu đã được gửi!', 'success');
    email.value = '';
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
    <div class="card shadow-lg p-4 p-md-5 auth-card">
      <div class="card-body">
        <h2 class="card-title text-center mb-4 fw-bold">Quên mật khẩu</h2>
        <p class="text-center text-muted mb-4">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>

        <BaseAlert v-if="errorMessage" :message="errorMessage" type="danger" class="mb-4" />
        <BaseAlert v-if="successMessage" :message="successMessage" type="success" class="mb-4" />

        <form @submit.prevent="handleForgotPassword" v-if="!successMessage">
          <div class="mb-4">
            <BaseInput
              id="email"
              label="Email"
              type="email"
              v-model="email"
              placeholder="Nhập địa chỉ email của bạn"
              required
            />
          </div>
          <BaseButton type="submit" :loading="isLoading" class="w-100 btn-lg btn-primary">
            Gửi liên kết
          </BaseButton>
        </form>

        <p class="text-center text-muted mt-4">
          Nhớ lại mật khẩu?
          <RouterLink to="/auth/login" class="text-decoration-none fw-bold">Đăng nhập</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-card { max-width: 450px; width: 100%; border-radius: var(--bs-border-radius-lg); background-color: var(--bs-white); }
.card-title { color: var(--bs-primary); }
.min-vh-75 { min-height: 75vh; }
</style>