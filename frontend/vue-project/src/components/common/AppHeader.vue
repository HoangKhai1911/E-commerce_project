<template>
  <header class="navbar navbar-expand-lg navbar-light bg-light shadow-sm sticky-top">
    <div class="container">
      <router-link :to="{ name: 'Home' }" class="navbar-brand fw-bold text-gradient">
        MyBlog
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link :to="{ name: 'Home' }" class="nav-link" active-class="active">Trang chủ</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'CategoriesList' }" class="nav-link" active-class="active">Danh mục</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'PostList' }" class="nav-link" active-class="active">Bài viết</router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'Search' }" class="nav-link" active-class="active">Tìm kiếm</router-link>
          </li>
        </ul>

        <ul class="navbar-nav">
          <li v-if="isAuthenticated" class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Chào mừng, {{ authStore.user?.username || 'Bạn' }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
              <li>
                <router-link :to="{ name: 'Profile' }" class="dropdown-item">Hồ sơ của tôi</router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Preferences' }" class="dropdown-item">Sở thích</router-link>
              </li>
              <li v-if="isAdmin">
                <router-link :to="{ name: 'AdminDashboard' }" class="dropdown-item">Trang Admin</router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button @click="handleLogout" class="dropdown-item">Đăng xuất</button>
              </li>
            </ul>
          </li>
          <li v-else class="nav-item">
            <router-link :to="{ name: 'Login' }" class="btn btn-primary me-2">Đăng nhập</router-link>
            <router-link :to="{ name: 'Register' }" class="btn btn-outline-primary">Đăng ký</router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/store/auth';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { isAuthenticated, isAdmin } = storeToRefs(authStore);

const handleLogout = () => {
  authStore.logout();
};
</script>

<style scoped>
/* Custom styles for the header if needed */
.navbar-brand {
  font-size: 1.75rem;
}

.nav-link.active {
  font-weight: bold;
  color: var(--bs-primary) !important; /* Ensure active link color */
}
</style>