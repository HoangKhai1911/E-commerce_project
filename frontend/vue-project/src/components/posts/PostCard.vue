<template>
  <div class="card h-100 shadow-sm border-0">
    <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }">
      <img
        :src="post.thumbnail?.url || '/images/default-post-image.png'"
        class="card-img-top"
        loading="lazy"
        alt="Post Cover"
      />
    </router-link>
    <div class="card-body d-flex flex-column">
      <h5 class="card-title fw-bold">
        <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="text-decoration-none text-dark">
          <HighlightText :text="post.title" :query="searchQuery" />
        </router-link>
      </h5>
      <p v-if="post.excerpt" class="card-text text-muted small flex-grow-1">
        {{ post.excerpt }}
      </p>
      <div class="d-flex justify-content-between align-items-center mt-auto pt-3">
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
      <div class="mt-2" v-if="post.categories && post.categories.length > 0">
        <router-link
          v-for="category in displayedCategories"
          :key="category.id"
          :to="{ name: 'CategoryDetail', params: { slug: category.slug } }"
          class="badge bg-primary text-decoration-none me-1 mb-1"
        >
          {{ category.name }}
        </router-link>
        <span v-if="remainingCategoriesCount > 0" class="badge bg-secondary text-decoration-none me-1 mb-1" title="Các danh mục khác">
          +{{ remainingCategoriesCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
// import type { Post } from '@/type'; // This type seems to be incomplete.
import HighlightText from '@/components/common/HighlightText.vue';

// Define a more complete local Post type to resolve TypeScript errors.
// This should ideally be in a central types file (e.g., src/type/index.ts)
// and used across the application for consistency.
interface Author {
  id: number;
  username?: string;
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
  thumbnail?: {
    url: string;
  };
}
const props = defineProps<{
  post: Post;
  searchQuery?: string;
}>();

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
  // Ghi chú: Thuộc tính 'content' phải có sẵn trên đối tượng post.
  // Bạn có thể cần cập nhật các lệnh gọi API để lấy về trường này.
  if (!props.post.content) {
    return null;
  }

  // Bỏ các thẻ HTML để đếm từ chính xác hơn
  const text = props.post.content.replace(/<[^>]*>?/gm, '');
  const wordsPerMinute = 200; // Tốc độ đọc trung bình
  const numberOfWords = text.split(/\s/g).length;
  const minutes = Math.ceil(numberOfWords / wordsPerMinute);

  // Hiển thị ít nhất 1 phút
  return `${Math.max(1, minutes)} phút đọc`;
});

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};
</script>

<style scoped>
.card-img-top {
  height: 180px;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.card:hover .card-img-top {
  transform: scale(1.03);
}

.card-title a {
  font-size: 1.15rem;
  line-height: 1.4;
  /* Giới hạn số dòng cho tiêu đề nếu cần */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-text {
  font-size: 0.9rem;
  /* Giới hạn số dòng cho excerpt */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
  transition: all 0.2s ease-in-out;
}

.badge:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}
</style>