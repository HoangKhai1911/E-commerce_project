<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi'; // Import useApi
import api from '@/lib/api'; // Import API client thực tế
import BaseAlert from '@/components/ui/BaseAlert.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();

const verificationStatus = ref<'loading' | 'success' | 'error'>('loading');
const message = ref('');
const countdown = ref(3); // State for countdown timer
let countdownInterval: ReturnType<typeof setInterval> | undefined;

// Lấy hàm `execute` từ composable `useApi` để thực hiện gọi API một cách thủ công.
// `immediate: false` để API không được gọi ngay lập tức.
const { data, execute: verifyEmail } = useApi<{ message: string }>(
  (token: string) => api.get(`/auth/verify-email?token=${token}`),
  { immediate: false }
);

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    verificationStatus.value = 'error';
    message.value = 'Không tìm thấy token xác minh email.';
    return;
  }

  try {
    await verifyEmail(token);
    verificationStatus.value = 'success';
    message.value = data.value?.message || 'Email của bạn đã được xác minh thành công!';

    // Bắt đầu đếm ngược để chuyển hướng
    countdownInterval = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        clearInterval(countdownInterval);
        router.push({ name: 'Login' });
      }
    }, 1000);
  } catch (err: any) {
    verificationStatus.value = 'error';
    message.value = err.response?.data?.message || 'Xác minh email thất bại. Token không hợp lệ hoặc đã hết hạn.';
    console.error('Email verification error:', err);
  }
});

onUnmounted(() => {
  // Dọn dẹp interval khi component bị hủy để tránh memory leak
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});
</script>

<template>
  <div class="container py-5 d-flex justify-content-center align-items-center min-vh-75">
    <div class="card shadow-lg p-4 p-md-5 auth-card text-center">
      <div class="card-body">
        <h2 class="card-title mb-4 fw-bold">Xác minh Email</h2>

        <LoadingSpinner v-if="verificationStatus === 'loading'" class="my-4" />

        <BaseAlert
          v-if="verificationStatus === 'success'"
          :message="message"
          type="success"
          class="mb-4"
        />
        <div v-if="verificationStatus === 'success'" class="mt-3">
          <p class="text-muted">
            Bạn sẽ được chuyển đến trang đăng nhập sau <strong>{{ countdown }}</strong> giây...
          </p>
          <div class="progress" style="height: 5px;">
            <div
              class="progress-bar progress-bar-striped progress-bar-animated bg-success"
              role="progressbar"
              :style="{ width: ((3 - countdown) / 3) * 100 + '%' }"
              aria-valuenow="countdown"
              aria-valuemin="0"
              aria-valuemax="3"
            ></div>
          </div>
        </div>
        <BaseAlert
          v-if="verificationStatus === 'error'"
          :message="message"
          type="danger"
          class="mb-4"
        />

        <div v-if="verificationStatus !== 'loading'">
          <RouterLink to="/auth/login" class="btn btn-primary btn-lg mt-3">Đi đến trang đăng nhập</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.auth-card {
  max-width: 550px;
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