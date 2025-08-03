<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { usePosts } from '@/composables/usePosts';
import PostCard from '@/components/posts/PostCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  publishedAt: string;
  clickCount: number;
  categories?: Array<{ name: string; slug: string }>;
  source?: { name: string };
  thumbnail_url?: string;
}

const route = useRoute();
const { getPostsByCategory, isLoading, error } = usePosts();

const categorySlug = ref<string>(route.params.slug as string);
const categoryName = ref<string>('');
const posts = ref<Post[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const pageSize = 9; // Số lượng bài viết mỗi trang

const fetchPosts = async () => {
  posts.value = []; // Clear current posts
  error.value = null; // Clear previous errors
  try {
    const response = await getPostsByCategory(categorySlug.value, currentPage.value, pageSize);
    categoryName.value = response.data.length > 0 && response.data[0].categories ?
                         response.data[0].categories.find(cat => cat.slug === categorySlug.value)?.name || categorySlug.value :
                         categorySlug.value; // Lấy tên danh mục từ bài viết đầu tiên nếu có
    posts.value = response.data;
    totalPages.value = response.meta.pagination.pageCount;
  } catch (err) {
    console.error('Error fetching category posts:', err);
    error.value = 'Không thể tải bài viết cho danh mục này.';
  }
};

onMounted(fetchPosts);
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    categorySlug.value = newSlug as string;
    currentPage.value = 1; // Reset trang khi slug thay đổi
    fetchPosts();
  }
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    fetchPosts();
  }
};
</script>

<template>
  <div class="container py-5">
    <h2 class="mb-5 text-center text-primary fw-bold">Bài viết trong Danh mục: "{{ categoryName }}"</h2>

    <LoadingSpinner v-if="isLoading" class="my-5" />
    <BaseAlert v-if="error" :message="error" type="danger" class="mb-4" />

    <div v-if="!isLoading && !error && posts.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="post in posts" :key="post.id">
        <PostCard :post="post" />
      </div>
    </div>

    <div v-else-if="!isLoading && !error && posts.length === 0" class="alert alert-info text-center" role="alert">
      Không tìm thấy bài viết nào trong danh mục này.
    </div>

    <nav v-if="!isLoading && !error && totalPages > 1" aria-label="Page navigation" class="mt-5">
      <ul class="pagination justify-content-center shadow-sm rounded-pill py-2 px-3 bg-white">
        <li class="page-item" :class="{ 'disabled': currentPage === 1 }">
          <a class="page-link rounded-pill px-3 me-2" href="#" @click.prevent="goToPage(currentPage - 1)">Trước</a>
        </li>
        <li class="page-item" v-for="page in totalPages" :key="page" :class="{ 'active': currentPage === page }">
          <a class="page-link rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
        </li>
        <li class="page-item" :class="{ 'disabled': currentPage === totalPages }">
          <a class="page-link rounded-pill px-3 ms-2" href="#" @click.prevent="goToPage(currentPage + 1)">Tiếp</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<style lang="scss" scoped>
.pagination {
  .page-item {
    .page-link {
      margin: 0 5px;
      border: none;
      background-color: transparent;
      color: var(--bs-dark);
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--bs-primary-bg-subtle);
        color: var(--bs-primary);
      }
    }

    &.active .page-link {
      background-color: var(--bs-primary);
      color: var(--bs-white);
      box-shadow: 0 0.25rem 0.5rem rgba(var(--bs-primary-rgb), 0.2);
    }

    &.disabled .page-link {
      color: var(--bs-gray-500);
      pointer-events: none;
    }
  }
}
</style>