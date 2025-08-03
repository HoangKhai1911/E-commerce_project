<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi'; // Import useApi
import BaseAlert from '@/components/ui/BaseAlert.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const route = useRoute();
const router = useRouter();
const api = useApi();

const verificationStatus = ref<'loading' | 'success' | 'error'>('loading');
const message = ref('');

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    verificationStatus.value = 'error';
    message.value = 'Không tìm thấy token xác minh email.';
    return;
  }

  try {
    const response = await api.get(`/auth/verify-email?token=${token}`);
    verificationStatus.value = 'success';
    message.value = response.data.message || 'Email của bạn đã được xác minh thành công! Bây giờ bạn có thể đăng nhập.';
  } catch (err: any) {
    verificationStatus.value = 'error';
    message.value = err.response?.data?.message || 'Xác minh email thất bại. Token không hợp lệ hoặc đã hết hạn.';
    console.error('Email verification error:', err);
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