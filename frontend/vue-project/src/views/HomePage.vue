<template>
  <div>
    <AppHeader />

    <!-- Loading Spinner hoặc nội dung chính -->
    <div v-if="isLoading" class="container text-center py-5 my-5">
      <LoadingSpinner />
      <p class="mt-3 text-muted">Đang tải dữ liệu trang chủ...</p>
    </div>

    <!-- Hiển thị lỗi -->
    <div v-else-if="error" class="container my-5">
      <!-- Giả định bạn có một component BaseAlert để hiển thị thông báo -->
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>

    <!-- Nội dung chính của trang, sử dụng layout Bootstrap 5 -->
    <main v-else class="container py-5">
      <!-- Khu vực hiển thị các danh mục nổi bật -->
      <section v-if="trendingCategories.length > 0" class="mb-5">
        <h2 class="text-center fw-bold mb-4">Chủ đề nổi bật</h2>
        <div class="row g-3 justify-content-center">
          <!-- Sử dụng grid của Bootstrap để responsive -->
          <div v-for="category in trendingCategories" :key="category.id" class="col-6 col-sm-4 col-md-3 col-lg-2">
            <CategoryCard :category="category" />
          </div>
        </div>
      </section>

      <!-- Khu vực hiển thị các bài viết được đề xuất -->
      <section v-if="recommendedPosts.length > 0" class="mb-5">
        <h2 class="text-center fw-bold mb-4">Bài viết dành cho bạn</h2>
        <div class="row g-4">
          <div v-for="post in recommendedPosts" :key="post.id" class="col-12 col-md-6 col-lg-4">
            <PostCard :post="post" />
          </div>
        </div>
      </section>

      <!-- Khu vực hiển thị các bài viết mới nhất -->
      <section v-if="latestPosts.length > 0">
        <h2 class="text-center fw-bold mb-4">Bài viết mới nhất</h2>
        <div class="row g-4">
          <div v-for="post in latestPosts" :key="post.id" class="col-12 col-md-6 col-lg-4">
            <PostCard :post="post" />
          </div>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { usePostsStore } from '@/store/posts';
import { storeToRefs } from 'pinia';

// Import các components con
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import PostCard from '@/components/posts/PostCard.vue';
import CategoryCard from '@/components/categories/CategoryCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

// Khởi tạo store
const postsStore = usePostsStore();

// Sử dụng storeToRefs để lấy state từ store và giữ tính reactive
// Điều này sẽ giải quyết tất cả các lỗi 'never[]' và 'property does not exist'
const { latestPosts, recommendedPosts, trendingCategories, status, error } = storeToRefs(postsStore);

// Tạo một computed property để quản lý trạng thái loading
const isLoading = computed(() => status.value === 'loading');

onMounted(async () => {
  try {
    // Gọi song song các action từ store để tải dữ liệu hiệu quả hơn
    await Promise.all([
      postsStore.fetchRecommendedPosts(),
      postsStore.fetchLatestPosts(),
      postsStore.fetchTrendingCategories(),
    ]);
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    // Store đã tự xử lý và lưu lỗi, component sẽ tự động hiển thị
  }
});
</script>
