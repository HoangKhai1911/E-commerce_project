<template>
  <div class="container py-5">
    <h1 class="mb-4">Tìm kiếm bài viết</h1>
    <div class="mb-4">
      <input 
        type="text" 
        class="form-control form-control-lg" 
        placeholder="Nhập từ khóa tìm kiếm..."
        v-model="searchQuery"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && searchQuery" class="text-center mt-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tìm kiếm...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger mt-4">
      {{ error }}
    </div>

    <!-- Results -->
    <div v-else-if="posts?.data?.length > 0">
      <p class="text-muted">Tìm thấy {{ posts.meta.pagination.total }} kết quả cho "<strong>{{ searchQuery }}</strong>".</p>
      <div class="list-group">
        <a v-for="post in posts.data" :key="post.id" href="#" class="list-group-item list-group-item-action">
          {{ post.attributes.title }}
        </a>
      </div>
    </div>
    
    <!-- No Results -->
    <div v-else-if="searchQuery && !isLoading">
       <p class="text-center mt-4">Không tìm thấy kết quả nào cho "<strong>{{ searchQuery }}</strong>".</p>
    </div>

    <!-- Initial State -->
    <div v-else class="text-center text-muted mt-4">
      <p>Bắt đầu tìm kiếm bằng cách gõ vào ô bên trên.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import api from '@/lib/api';

const searchQuery = ref('');

// Hàm gọi API giờ sẽ nhận `query` từ `watchSources` và `options` chứa `signal`
const searchPosts = (query: string, options: { signal: AbortSignal }) => {
  // Không tìm kiếm nếu query rỗng, trả về promise rỗng để xóa kết quả
  if (!query.trim()) {
    return Promise.resolve({ data: { data: [], meta: { pagination: {} } } });
  }
  return api.get('/recommendations/search', {
    params: { q: query },
    signal: options.signal, // Quan trọng: truyền signal vào axios
  });
};

const { 
  data: posts, 
  isLoading, 
  error 
} = useApi(searchPosts, {
  initialData: { data: [], meta: { pagination: {} } },
  // Không chạy ngay khi component mount
  immediate: false, 
  // Theo dõi sự thay đổi của `searchQuery` để tự động gọi lại API
  watchSources: searchQuery,
  // Chỉ gọi API sau khi người dùng ngừng gõ 300ms
  debounce: 300
});
</script>