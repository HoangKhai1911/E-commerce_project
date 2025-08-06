<template>
  <div class="container py-5">
    <h2 class="mb-5 text-center text-primary fw-bold">Khám phá các Danh mục</h2>

    <!-- Hiển thị Loading Spinner khi đang tải dữ liệu -->
    <LoadingSpinner v-if="allCategoriesLoading" class="my-5" />
    <!-- Hiển thị thông báo lỗi nếu có -->
    <BaseAlert v-if="allCategoriesError" :message="allCategoriesError" type="danger" class="mb-4" />

    <!-- Hiển thị danh sách danh mục nếu không tải và không có lỗi, và có dữ liệu -->
    <div v-if="!allCategoriesLoading && !allCategoriesError && allCategories.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="category in allCategories" :key="category.id">
        <!-- Liên kết đến trang chi tiết danh mục -->
        <RouterLink :to="`/categories/${category.slug}`" class="card category-card h-100 shadow-sm border-0 text-decoration-none d-block">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <!-- Tên danh mục -->
            <h5 class="card-title fw-bold text-dark text-center mb-0">{{ category.name }}</h5>
            <!-- Hiển thị số lượng bài viết trong danh mục -->
            <p class="card-text text-muted mt-1">
              <small>{{ category.posts?.length || 0 }} bài viết</small>
            </p>
          </div>
        </RouterLink>
      </div>
    </div>

    <!-- Hiển thị thông báo nếu không tìm thấy danh mục nào -->
    <div v-else-if="!allCategoriesLoading && !allCategoriesError && allCategories.length === 0" class="alert alert-info text-center" role="alert">
      Không tìm thấy danh mục nào.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories'; // Import composable useCategories
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'; // Import LoadingSpinner
import BaseAlert from '@/components/ui/BaseAlert.vue'; // Import BaseAlert
import { RouterLink } from 'vue-router'; // Import RouterLink

// Lấy các state và hàm cần thiết từ useCategories
const { allCategories, allCategoriesLoading, allCategoriesError, fetchAllCategories } = useCategories();

// Khi component được mount, gọi hàm fetchAllCategories để tải dữ liệu
onMounted(() => {
  fetchAllCategories();
});
</script>

<style scoped>
/* Các style cho card danh mục */
.category-card {
  transition: all 0.2s ease-in-out;
  border-radius: var(--bs-border-radius-lg); /* Sử dụng border radius lớn hơn */
}

.category-card:hover {
  transform: translateY(-5px); /* Hiệu ứng nâng lên khi hover */
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1); /* Đổ bóng khi hover */
  border-color: var(--bs-primary) !important; /* Đổi màu viền khi hover */
}

.category-card .card-body {
  padding: 1rem;
}

.category-card .card-title {
  font-size: 1rem;
}

.category-card .bi {
  font-size: 2.5rem; /* Điều chỉnh kích thước icon */
}
</style>
