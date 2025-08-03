<template>
  <div class="admin-layout d-flex">
    <!-- Sidebar -->
    <aside class="sidebar bg-dark text-white vh-100 p-3 d-flex flex-column">
      <h3 class="text-center mb-4">
        <RouterLink to="/admin" class="text-white text-decoration-none">Admin</RouterLink>
      </h3>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item">
          <RouterLink to="/admin/dashboard" class="nav-link text-white">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/admin/sources" class="nav-link text-white">
            <i class="bi bi-newspaper me-2"></i>Quản lý Nguồn
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/admin/categories" class="nav-link text-white">
            <i class="bi bi-tags me-2"></i>Quản lý Danh mục
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/admin/posts" class="nav-link text-white">
            <i class="bi bi-file-post me-2"></i>Quản lý Bài viết
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/admin/users" class="nav-link text-white">
            <i class="bi bi-people me-2"></i>Quản lý Người dùng
          </RouterLink>
        </li>
      </ul>
      <hr>
      <div class="dropdown">
        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
          <img :src="authStore.user?.avatar?.url || '/default_avatar.png'" alt="" width="32" height="32" class="rounded-circle me-2">
          <strong>{{ authStore.user?.username }}</strong>
        </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser">
          <li><RouterLink class="dropdown-item" to="/profile">Hồ sơ</RouterLink></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item" href="#" @click.prevent="logout">Đăng xuất</a></li>
        </ul>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="main-content flex-grow-1 p-4">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  flex-shrink: 0;

  .nav-link {
    transition: background-color 0.2s ease, color 0.2s ease;
    border-radius: var(--bs-border-radius);

    &:hover,
    &.router-link-exact-active {
      background-color: var(--bs-primary);
      color: var(--bs-white) !important;
    }

    i {
      width: 20px;
      text-align: center;
    }
  }
}

.main-content {
  overflow-y: auto;
  background-color: var(--bs-light);
}
</style>