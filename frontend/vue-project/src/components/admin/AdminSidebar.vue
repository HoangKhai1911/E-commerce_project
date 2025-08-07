<template>
  <div class="d-flex flex-column flex-shrink-0 p-3 text-white bg-dark admin-sidebar">
    <router-link :to="{ name: 'Home' }" class="d-flex align-items-center mb-3 mb-md-0 me-md-auto text-white text-decoration-none">
      <i class="bi bi-bootstrap-fill me-2 fs-4"></i>
      <span class="fs-4">Admin Panel</span>
    </router-link>
    <hr>
    <ul class="nav nav-pills flex-column mb-auto">
      <li class="nav-item">
        <router-link :to="{ name: 'AdminDashboard' }" class="nav-link text-white" active-class="active">
          <i class="bi bi-speedometer2 me-2"></i>
          Tổng quan
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'PostManagement' }" class="nav-link text-white" active-class="active">
          <i class="bi bi-file-earmark-text me-2"></i>
          Quản lý Bài viết
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'SourceManagement' }" class="nav-link text-white" active-class="active">
          <i class="bi bi-journal-code me-2"></i>
          Quản lý Nguồn
        </router-link>
      </li>
      <li>
        <router-link :to="{ name: 'CategoryManagement' }" class="nav-link text-white" active-class="active">
          <i class="bi bi-tags me-2"></i>
          Quản lý Danh mục
        </router-link>
      </li>
    </ul>
    <hr>
    <div class="dropdown">
      <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
        <img :src="authStore.user?.avatar?.url || 'https://placehold.co/40x40/E8E8E8/444444?text=AV'" alt="" width="32" height="32" class="rounded-circle me-2">
        <strong>{{ authStore.user?.username }}</strong>
      </a>
      <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
        <li><router-link class="dropdown-item" :to="{ name: 'Profile'}">Hồ sơ</router-link></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item" href="#" @click.prevent="handleLogout">Đăng xuất</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'Home' }); // Chuyển hướng về trang chủ sau khi đăng xuất
};
const router = useRouter();
</script>

<style lang="scss" scoped>
.admin-sidebar {
  width: 280px;
  min-height: 100vh;

  .nav-link {
    &.active {
      background-color: #0d6efd; // Bootstrap primary color
    }
    &:hover:not(.active) {
      background-color: #495057;
    }
  }
}
</style>
