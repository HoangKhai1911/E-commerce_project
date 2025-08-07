<template>
  <div>
    <!-- Loading Spinner hoặc nội dung chính -->
    <div v-if="isLoading" class="container text-center py-5 my-5">
      <!-- Đây là chỗ để component LoadingSpinner, không phải AppHeader -->
      <LoadingSpinner />
      <p class="mt-3 text-muted">Đang tải dữ liệu trang chủ...</p>
    </div>

    <!-- Hiển thị lỗi -->
    <div v-else-if="error" class="container my-5">
      <div class="alert alert-danger" role="alert">
        {{ error }}
      </div>
    </div>

    <!-- Nội dung chính của trang, sử dụng layout Bootstrap 5 -->
    <main v-else class="container py-5">
      <!-- Khu vực hiển thị các danh mục nổi bật -->
      <!-- <section v-if="trendingCategories.length > 0" class="mb-5">
        <h2 class="text-center fw-bold mb-4">Chủ đề nổi bật</h2>
        <div class="row g-3 justify-content-center">
          <div v-for="category in trendingCategories" :key="category.id" class="col-6 col-sm-4 col-md-3 col-lg-2">
            <CategoryCard :category="category" />
          </div>
        </div>
      </section> -->

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
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { usePostsStore } from '@/store/posts';
import { storeToRefs } from 'pinia';

// Chú ý: Đã loại bỏ import AppHeader và AppFooter khỏi đây
import PostCard from '@/components/posts/PostCard.vue';
import CategoryCard from '@/components/categories/CategoryCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const postsStore = usePostsStore();
const { latestPosts, recommendedPosts, trendingCategories, status, error } = storeToRefs(postsStore);
const isLoading = computed(() => status.value === 'loading');

onMounted(async () => {
  try {
    await Promise.all([
      postsStore.fetchRecommendedPosts(),
      postsStore.fetchLatestPosts(),
      postsStore.fetchTrendingCategories(),
    ]);
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
  }
});
</script>
