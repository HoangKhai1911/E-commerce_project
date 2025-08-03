<template>
  <div>
    <h1 class="mb-4">Chào mừng, {{ authStore.user?.username }}!</h1>
    <p class="lead">Đây là trang tổng quan hệ thống.</p>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center mt-5">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger mt-5" role="alert">
      <h4 class="alert-heading">Lỗi!</h4>
      <p>{{ error }}</p>
      <hr>
      <p class="mb-0">Vui lòng thử lại sau hoặc liên hệ quản trị viên.</p>
    </div>

    <!-- Content -->
    <div v-else-if="stats" class="row mt-5">
      <!-- Card for Posts -->
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card text-white bg-primary h-100">
          <div class="card-header fw-bold fs-5">Tổng số bài viết</div>
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <h2 class="card-title display-4 fw-bold">{{ stats.posts }}</h2>
            <p class="card-text">Bài viết trong hệ thống</p>
          </div>
        </div>
      </div>

      <!-- Card for Users -->
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card text-white bg-success h-100">
          <div class="card-header fw-bold fs-5">Tổng số người dùng</div>
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <h2 class="card-title display-4 fw-bold">{{ stats.users }}</h2>
            <p class="card-text">Người dùng đã đăng ký</p>
          </div>
        </div>
      </div>

      <!-- Card for Categories -->
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card text-white bg-info h-100">
          <div class="card-header fw-bold fs-5">Tổng số danh mục</div>
          <div class="card-body d-flex flex-column justify-content-center align-items-center">
            <h2 class="card-title display-4 fw-bold">{{ stats.categories }}</h2>
            <p class="card-text">Danh mục tin tức</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAuthStore } from '@/store/auth';
import { useApi } from '@/composables/useApi';
import api from '@/lib/api';

interface DashboardStats {
  posts: number;
  users: number;
  categories: number;
}

const authStore = useAuthStore();

// Sử dụng composable để đóng gói logic gọi API.
// Vì `immediate` mặc định là true, API sẽ được gọi ngay khi component được setup.
const { 
  data: stats, 
  isLoading, 
  error, 
  execute: fetchStats // Vẫn có thể dùng fetchStats để làm mới dữ liệu thủ công
} = useApi<DashboardStats>((options) => api.get('/dashboard/stats', options), {
  initialData: { posts: 0, users: 0, categories: 0 },
});

// Không cần onMounted nữa! Composable đã tự động thực thi.
</script>
