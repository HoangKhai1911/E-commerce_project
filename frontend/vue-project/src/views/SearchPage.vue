<template>
  <div class="container py-5">
    <h1 class="mb-4">
      Kết quả tìm kiếm
      <span v-if="searchedQuery" class="text-primary">: "{{ searchedQuery }}"</span>
    </h1>
    <div class="mb-4">
      <input 
        type="text" 
        class="form-control form-control-lg" 
        placeholder="Nhập từ khóa tìm kiếm..."
        v-model="searchQuery"
        aria-label="Search input"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center mt-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tìm kiếm...</span>
      </div>
      <p class="mt-2 text-muted">Đang tìm kiếm...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger mt-4">
      Đã có lỗi xảy ra: {{ errorMessage }}
    </div>

    <!-- Results -->
    <div v-else-if="posts && posts.data && posts.data.length > 0">
      <p class="text-muted mb-3">Tìm thấy {{ posts.meta.pagination.total }} kết quả.</p>
      <div class="list-group">
        <RouterLink 
          v-for="post in posts.data" 
          :key="post.id" 
          :to="{ name: 'PostDetail', params: { slug: post.slug } }" 
          class="list-group-item list-group-item-action"
        >
          <h5 class="mb-1">
            <HighlightText :text="post.title" :query="searchedQuery" />
          </h5>
          <small class="text-muted">Đăng bởi {{ post.author?.username || 'N/A' }}</small>
        </RouterLink>
      </div>
    </div>
    
    <!-- No Results -->
    <div v-else-if="searchedQuery && !isLoading" class="text-center text-muted mt-5">
       <i class="bi bi-search fs-1"></i>
       <p class="mt-3">Không tìm thấy kết quả nào cho "<strong>{{ searchedQuery }}</strong>".</p>
    </div>

    <!-- Initial State -->
    <div v-else-if="!searchedQuery && !isLoading" class="text-center text-muted mt-5">
      <i class="bi bi-keyboard fs-1"></i>
      <p>Bắt đầu tìm kiếm bằng cách gõ vào ô bên trên.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import api from '@/lib/api';
import HighlightText from '@/components/common/HighlightText.vue';

const route = useRoute();

// `searchQuery` được liên kết với ô input, phản ánh nội dung người dùng đang gõ.
const searchQuery = ref((route.query.q as string) || '');
// `searchedQuery` lưu trữ từ khóa đã được gửi đi để tìm kiếm.
// Biến này được dùng cho tiêu đề và highlight, đảm bảo chúng khớp với kết quả đang hiển thị.
const searchedQuery = ref((route.query.q as string) || '');

const router = useRouter();

// Hàm gọi API giờ sẽ nhận `query` từ `watchSources` và `options` chứa `signal`
const searchPosts = (query: string, options: { signal: AbortSignal }) => {
  const trimmedQuery = query.trim();
  // Cập nhật lại từ khóa đã tìm kiếm khi một tìm kiếm mới được thực thi
  searchedQuery.value = trimmedQuery;

  // Cập nhật URL để phản ánh tìm kiếm hiện tại mà không thêm vào lịch sử trình duyệt
  router.replace({ query: { q: trimmedQuery || undefined } });

  // Không tìm kiếm nếu query rỗng, trả về promise rỗng để xóa kết quả
  if (!trimmedQuery) {
    return Promise.resolve({ data: { data: [], meta: { pagination: {} } } });
  }
  return api.get('/recommendations/search', {
    params: { q: trimmedQuery },
    signal: options.signal, // Quan trọng: truyền signal vào axios
  });
};

const {
  data: posts,
  isLoading,
  error
} = useApi(searchPosts, {
  initialData: { data: [], meta: { pagination: {} } },
  // Chạy ngay khi component được tải để tìm kiếm với query từ URL (nếu có)
  immediate: true,
  // Theo dõi sự thay đổi của `searchQuery` để tự động gọi lại API
  watchSources: searchQuery,
  // Chỉ gọi API sau khi người dùng ngừng gõ 300ms
  debounce: 300
});

// Computed property để xử lý và hiển thị thông báo lỗi một cách an toàn
const errorMessage = computed(() => {
  if (!error.value) return '';
  // Kiểm tra nếu error.value là một object và có thuộc tính 'message'
  if (typeof error.value === 'object' && error.value !== null && 'message' in error.value) {
    return (error.value as { message: string }).message;
  }
  return String(error.value); // Nếu là string hoặc kiểu khác, chuyển thành string
});

// Theo dõi sự thay đổi của query trên URL (khi người dùng tìm kiếm từ header)
watch(() => route.query.q, (newQuery) => {
  const queryStr = (newQuery as string) || '';
  // Cập nhật giá trị của ô input, việc này sẽ tự động kích hoạt `useApi` ở trên
  searchQuery.value = queryStr;
});
</script>