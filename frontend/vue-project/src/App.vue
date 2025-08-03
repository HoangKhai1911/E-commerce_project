<script setup lang="ts">
import { useAuthStore } from '@/store/auth';
import { onMounted } from 'vue';
import TheNotification from '@/components/ui/TheNotification.vue';

const authStore = useAuthStore();

// Khởi tạo trạng thái xác thực khi ứng dụng được mount
// Điều này giúp tải lại thông tin user nếu đã có token trong localStorage
onMounted(async () => {
  // Kiểm tra nếu có token nhưng chưa có thông tin user (ví dụ khi tải lại trang),
  // bạn có thể gọi một action để lấy lại thông tin.
  if (authStore.accessToken && !authStore.user) {
    // await authStore.fetchUser(); // Bạn có thể tạo action này trong authStore
  }
});
</script>

<template>
  <!-- RouterView sẽ render layout phù hợp (Default, Auth, Admin) -->
  <RouterView />
  <!-- TheNotification được đặt ở đây để hiển thị trên tất cả các trang -->
  <TheNotification />
</template>

<style lang="scss">
// Import global styles
@import '@/assets/css/main.scss';

#app {
  // Có thể thêm các style tổng thể cho app container ở đây
}
</style>
