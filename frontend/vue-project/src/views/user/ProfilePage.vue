<script setup lang="ts">
// Nơi bạn sẽ thêm logic cho trang profile, ví dụ: lấy thông tin người dùng từ store
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
</script>

<template>
  <div class="container py-5">
    <h1 class="mb-4">Trang cá nhân</h1>
    <p v-if="authStore.user">Xin chào, {{ authStore.user.username }}!</p>
  </div>
</template>
// https://vueapp/login/admin