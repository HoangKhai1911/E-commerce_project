<template>
  <div class="container py-5">
    <h1 class="mb-5 text-center post-list-title">Danh sách bài viết</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="row g-4">
      <div v-for="n in 6" :key="n" class="col-12 col-md-6 col-lg-4">
        <PostCardSkeleton />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger custom-alert shadow-sm" role="alert">
      <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="flattenedPosts.length > 0">
      <div class="row g-4">
        <div
          v-for="post in flattenedPosts"
          :key="post.id"
          class="col-12 col-md-6 col-lg-4 d-flex align-items-stretch"
        >
          <!-- Truyền đối tượng bài viết đã được làm phẳng vào component PostCard -->
          <PostCard :post="post" class="w-100 h-100 post-card-enhanced" />
        </div>
      </div>

      <!-- Pagination Controls -->
      <BasePagination
        v-if="posts.meta && posts.meta.pagination && posts.meta.pagination.pageCount > 1"
        v-model="currentPage"
        :meta="posts.meta.pagination"
        class="mt-5 d-flex justify-content-center"
      />
    </div>

    <!-- No posts -->
    <div v-else class="text-center text-muted mt-5">
      <p class="fs-4">Chưa có bài viết nào.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import api from '@/lib/api';
import BasePagination from '@/components/ui/BasePagination.vue';
import PostCard from '@/components/posts/PostCard.vue';
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue';

const currentPage = ref(1);

const fetchPosts = (page: number) => {
  return api.get('/posts', {
    params: {
      'pagination[page]': page,
      'pagination[pageSize]': 6,
      'sort': 'publishedAt:desc',
      'populate[image]': '*',
      'populate[author][populate][avatar]': '*',
      'populate[categories]': '*'
    }
  });
};

const { 
  data: posts, 
  isLoading, 
  error 
} = useApi(fetchPosts, {
  initialData: {
    data: [],
    meta: {
      pagination: { page: 1, pageSize: 6, pageCount: 1, total: 0 }
    }
  },
  watchSources: currentPage
});

const flattenedPosts = computed(() => {
  if (!posts.value || !posts.value.data) {
    return [];
  }
  return posts.value.data.map((post: any) => {
    const imageData = post.attributes.image?.data?.map((img: any) => img.attributes) || [];
    const authorData = post.attributes.author?.data?.attributes;
    const authorAvatar = post.attributes.author?.data?.attributes?.avatar?.data?.attributes;
    const flattenedAuthor = authorData ? { ...authorData, avatar: authorAvatar } : null;
    const flattenedCategories = post.attributes.categories?.data?.map((c: any) => ({
      id: c.id,
      ...c.attributes
    })) || [];

    return {
      id: post.id,
      slug: post.attributes.slug,
      title: post.attributes.title,
      excerpt: post.attributes.excerpt,
      publishedAt: post.attributes.publishedAt,
      image: imageData,
      author: flattenedAuthor,
      categories: flattenedCategories,
    };
  });
});
</script>

<style scoped>
/* Import font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');

/* ================================================
 Màu sắc & Phông chữ
 ================================================ */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --bg-light: #f8f9fa;
  --bg-skyblue: #e3f2fd;
  --bg-white: #ffffff;
  --text-dark: #212529;
  --text-muted: #6c757d;
  --border-color: #dee2e6;
  --box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  --box-shadow-hover: 0 8px 16px rgba(0, 0, 0, 0.1);
  --border-radius: 1rem;
}

body {
  font-family: 'Roboto', sans-serif;
  background-color: var(--bg-skyblue);
  color: var(--text-dark);
}

/* ================================================
 Tiêu đề chính
 ================================================ */
.post-list-title {
  font-weight: 900;
  color: var(--text-dark);
  font-size: 3.5rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  position: relative;
  margin-bottom: 4rem !important;
  background: linear-gradient(to right, #007bff, #00c6ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.post-list-title::after {
  content: '';
  display: block;
  width: 100px;
  height: 6px;
  background: linear-gradient(to right, #007bff, #00c6ff);
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 4px;
}

/* ================================================
 Thẻ bài viết
 ================================================ */
.post-card-enhanced {
  background-color: var(--bg-white);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  border: 1px solid var(--border-color);
}

.post-card-enhanced:hover {
  transform: translateY(-8px);
  box-shadow: var(--box-shadow-hover);
  border-color: var(--primary-color);
}

/* ================================================
 Thông báo
 ================================================ */
.custom-alert {
  border-radius: var(--border-radius);
  font-weight: 500;
  padding: 1.5rem;
  background-color: #ffe0e0;
  border-left: 5px solid #dc3545;
  color: #b02a37;
  box-shadow: 0 0.5rem 1rem rgba(255, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
