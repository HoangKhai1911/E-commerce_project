<template>
  <div class="card h-100 shadow-sm border-0 rounded-lg overflow-hidden">
    <RouterLink :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="d-block text-decoration-none text-dark">
      <div class="post-thumbnail-wrapper bg-light d-flex align-items-center justify-content-center" style="height: 180px;">
        <img
          v-if="post.image && post.image.length > 0 && post.image[0].url"
          :src="`${strapiBaseUrl}${post.image[0].url}`"
          :alt="post.image[0].alternativeText || post.title"
          class="card-img-top"
          loading="lazy"
          style="object-fit: cover; width: 100%; height: 100%;"
          onerror="this.onerror=null;this.src='/images/default-post-image.png';"
        />
        <div v-else class="text-muted text-center p-3">
          <i class="bi bi-image display-4"></i>
          <p class="mb-0">Không có ảnh bìa</p>
        </div>
      </div>
    </RouterLink>

    <div class="card-body d-flex flex-column">
      <h5 class="card-title fw-bold mb-2">
        <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="text-decoration-none text-dark">
          <HighlightText :text="post.title" :query="searchQuery" />
        </router-link>
      </h5>

      <p v-if="post.excerpt" class="card-text text-muted small flex-grow-1 text-truncate-3-lines">
        {{ post.excerpt }}
      </p>
      <div v-else-if="post.content" class="card-text text-muted small flex-grow-1" v-html="shortContent"></div>

      <div v-if="post.source?.url" class="mt-2">
        <a
          :href="post.source.url"
          target="_blank"
          rel="noopener noreferrer"
          class="small text-decoration-underline text-muted"
        >
          Nguồn bài gốc
        </a>
      </div>

      <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
        <div class="d-flex align-items-center">
          <img
            :src="post.author?.avatar?.url || '/images/default-avatar.png'"
            alt="Author Avatar"
            class="rounded-circle me-2"
            style="width: 30px; height: 30px; object-fit: cover;"
          />
          <small class="text-muted">{{ post.author?.username || 'Ẩn danh' }}</small>
        </div>
        <small class="text-muted">
          {{ formatDate(post.publishedAt) }}
          <span v-if="readingTime" class="mx-1">&middot;</span>
          <span v-if="readingTime">{{ readingTime }}</span>
        </small>
      </div>
    </div>

    <div class="card-footer bg-white border-0 pt-0 pb-3 px-3">
      <div class="d-flex flex-wrap gap-1">
        <router-link
          v-for="category in displayedCategories"
          :key="category.id"
          :to="{ name: 'CategoryDetail', params: { slug: category.slug } }"
          class="badge bg-primary-subtle text-primary-emphasis fw-normal rounded-pill text-decoration-none"
        >
          {{ category.name }}
        </router-link>
        <span v-if="remainingCategoriesCount > 0" class="badge bg-secondary-subtle text-secondary-emphasis fw-normal rounded-pill" title="Các danh mục khác">
          +{{ remainingCategoriesCount }}
        </span>
        <span v-if="!post.categories || post.categories.length === 0" class="badge bg-secondary-subtle text-secondary-emphasis fw-normal rounded-pill">
          Chưa phân loại
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import HighlightText from '@/components/common/HighlightText.vue';

interface Author {
  id: number;
  username: string;
  avatar?: {
    url: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Post {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  publishedAt: string;
  author?: Author;
  categories?: Category[];
  image?: {
    url: string;
    alternativeText?: string;
  }[];
  source?: {
    name?: string;
    url?: string;
  };
}

const props = defineProps<{
  post: Post;
  searchQuery?: string;
}>();

const strapiBaseUrl = import.meta.env.VITE_STRAPI_API_URL || 'http://localhost:1337';

const CATEGORY_LIMIT = 2;

const displayedCategories = computed(() => {
  if (!props.post.categories) return [];
  return props.post.categories.slice(0, CATEGORY_LIMIT);
});

const remainingCategoriesCount = computed(() => {
  if (!props.post.categories || props.post.categories.length <= CATEGORY_LIMIT) {
    return 0;
  }
  return props.post.categories.length - CATEGORY_LIMIT;
});

const readingTime = computed(() => {
  if (!props.post.content) {
    return null;
  }
  const text = props.post.content.replace(/<[^>]*>?/gm, '');
  const wordsPerMinute = 200;
  const numberOfWords = text.split(/\s/g).length;
  const minutes = Math.ceil(numberOfWords / wordsPerMinute);
  return `${Math.max(1, minutes)} phút đọc`;
});

const shortContent = computed(() => {
  if (!props.post.content) return '';
  const text = props.post.content.replace(/<[^>]*>?/gm, '');
  return text.slice(0, 120) + '...';
});

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};
</script>