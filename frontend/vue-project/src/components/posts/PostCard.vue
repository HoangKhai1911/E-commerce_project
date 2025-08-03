<template>
  <div class="card h-100 shadow-sm border-0">
    <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }">
      <img
        :src="post.coverImage?.url || '/images/default-post-image.png'"
        class="card-img-top"
        alt="Post Cover"
      />
    </router-link>
    <div class="card-body d-flex flex-column">
      <h5 class="card-title fw-bold">
        <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="text-decoration-none text-dark">
          {{ post.title }}
        </router-link>
      </h5>
      <p v-if="post.excerpt" class="card-text text-muted small flex-grow-1">
        {{ post.excerpt }}
      </p>
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="d-flex align-items-center">
          <img
            :src="post.author?.avatar?.url || '/images/default-avatar.png'"
            alt="Author Avatar"
            class="rounded-circle me-2"
            style="width: 30px; height: 30px; object-fit: cover;"
          />
          <small class="text-muted">{{ post.author?.username || 'Ẩn danh' }}</small>
        </div>
        <small class="text-muted">{{ formatDate(post.publishedAt) }}</small>
      </div>
      <div class="mt-2">
        <router-link
          v-if="post.category"
          :to="{ name: 'CategoryDetail', params: { slug: post.category.slug } }"
          class="badge bg-primary text-decoration-none"
        >
          {{ post.category.name }}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PostAuthor {
  id: number;
  username: string;
  avatar?: { url: string };
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string; // Make excerpt optional
  coverImage?: {
    url: string;
  };
  author?: PostAuthor;
  category?: Category;
  publishedAt: string;
}

const props = defineProps<{
  post: Post;
}>();

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
}
</style>