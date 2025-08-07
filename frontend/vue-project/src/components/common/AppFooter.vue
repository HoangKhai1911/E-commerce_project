<template>
  <!-- Chỉ hiển thị nếu không phải là trang đăng nhập hoặc đăng ký -->
  <footer
    v-if="!isAuthPage"
    class="custom-footer text-white py-4 mt-auto"
  >
    <div class="container text-center">
      <p>&copy; {{ currentYear }} MyBlog. All rights reserved.</p>
      <nav class="nav justify-content-center flex-column flex-md-row">
        <!-- Bạn có thể thêm liên kết tại đây nếu muốn -->
      </nav>
      <div class="mt-3 text-white-20">
        <p class="mb-1">Phone: 0814 526 318</p>
        <p class="mb-0">Email: haki191104@gmail.com</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const currentYear = ref(new Date().getFullYear());
const route = useRoute();

// Kiểm tra nếu đang ở trang đăng nhập hoặc đăng ký
const isAuthPage = computed(() => {
  const hiddenRoutes = ['Login', 'Register'];
  return hiddenRoutes.includes(route.name as string);
});
</script>

<style scoped>
.custom-footer {
  background-color: #165d8a; /* Màu nền của footer */
}
</style>
