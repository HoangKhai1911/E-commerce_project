<template>
  <div class="container py-5">
    <h1 class="mb-4">Danh sách bài viết</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else>
      <div class="list-group">
        <RouterLink
          v-for="post in posts.data"
          :key="post.id"
          :to="{ name: 'PostDetail', params: { slug: post.attributes.slug } }"
          class="list-group-item list-group-item-action"
        >{{ post.attributes.title }}</RouterLink>
      </div>

      <!-- Pagination Controls -->
      <BasePagination v-model="currentPage" :meta="posts.meta.pagination" class="mt-4" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import api from '@/lib/api';
import BasePagination from '@/components/ui/BasePagination.vue';

// 1. Tạo một Ref để theo dõi trang hiện tại
const currentPage = ref(1);

// 2. Định nghĩa hàm gọi API, nhận `page` làm tham số
const fetchPosts = (page: number) => {
  return api.get('/posts', {
    params: {
      'pagination[page]': page,
      'pagination[pageSize]': 5, // Hiển thị 5 bài viết mỗi trang
    }
  });
};

// 3. Sử dụng `useApi` và truyền `currentPage` vào `watchSources`
const { 
  data: posts, 
  isLoading, 
  error 
} = useApi(fetchPosts, {
  // Cung cấp dữ liệu ban đầu để tránh lỗi template
  initialData: {
    data: [],
    meta: {
      pagination: { page: 1, pageSize: 5, pageCount: 1, total: 0 }
    }
  },
  // `useApi` sẽ tự động gọi lại `fetchPosts` mỗi khi `currentPage` thay đổi
  watchSources: currentPage
});
</script>