<template>
  <div class="card h-100 post-card-professional">
    <RouterLink :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="d-block text-decoration-none">
      <div class="post-thumbnail-wrapper" style="height: 230px;">
        <img
          v-if="post.image && post.image.length > 0 && post.image[0].url"
          :src="`${strapiBaseUrl}${post.image[0].url}`"
          :alt="post.image[0].alternativeText || post.title"
          class="card-img-top post-image"
          loading="lazy"
          onerror="this.onerror=null;this.src='/images/default-post-image.png';"
        />
        <div v-else class="placeholder-image">
          <i class="bi bi-image display-4 text-muted"></i>
          <p class="mb-0 text-muted">Không có ảnh bìa</p>
        </div>
      </div>
    </RouterLink>

    <div class="card-body d-flex flex-column p-4">
      <!-- Categories -->
      <div class="d-flex flex-wrap gap-2 mb-2">
        <router-link
          v-for="category in displayedCategories"
          :key="category.id"
          :to="{ name: 'CategoryDetail', params: { slug: category.slug } }"
          class="badge post-badge text-decoration-none"
        >
          {{ category.name }}
        </router-link>
        <span v-if="remainingCategoriesCount > 0" class="badge post-badge-secondary" title="Các danh mục khác">
          +{{ remainingCategoriesCount }}
        </span>
      </div>

      <h5 class="card-title fw-bold mb-2">
        <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="text-decoration-none text-dark card-title-link">
          <HighlightText :text="post.title" :query="searchQuery" />
        </router-link>
      </h5>

      <p v-if="post.excerpt" class="card-text text-muted small flex-grow-1 text-truncate-3-lines">
        {{ post.excerpt }}
      </p>
      <div v-else-if="post.content" class="card-text text-muted small flex-grow-1 text-truncate-3-lines" v-html="shortContent"></div>

      <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top-dashed">
        <!-- Author Info -->
        <div class="d-flex align-items-center">
          <img
            :src="post.author?.avatar?.url || '/images/default-avatar.png'"
            alt="Author Avatar"
            
          />
          
        </div>

        <!-- Date & Reading Time -->
        <small class="text-muted text-end">
          {{ formatDate(post.publishedAt) }}
          <span v-if="readingTime" class="mx-1">&middot;</span>
          <span v-if="readingTime">{{ readingTime }}</span>
        </small>
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

<style scoped>
/*
  ================================================
  Variables & Typography
  ================================================
*/
:root {
  --primary-color: #0d6efd;
  --secondary-color: #6c757d;
  --text-dark: #212529;
  --text-muted: #6c757d;
  --card-bg: #ffffff;
  --card-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.05);
  --card-shadow-hover: 0 1rem 2rem rgba(0, 0, 0, 0.1);
  --border-radius: 1rem;
}

.post-card-professional {
  border: none;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.post-card-professional:hover {
  transform: translateY(-8px);
  box-shadow: var(--card-shadow-hover);
}

/*
  ================================================
  Image & Placeholder
  ================================================
*/
.post-thumbnail-wrapper {
  background-color: #CED2D6FF;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0,0,0,.05);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.post-card-professional:hover .post-image {
  transform: scale(1.05);
}

.placeholder-image {
  text-align: center;
  padding: 2rem;
}

/*
  ================================================
  Content
  ================================================
*/
.card-title {
  font-weight: 700;
  line-height: 1.2;
  font-size: 1.25rem;
  text-align: center;
}

.card-title-link {
  color: var(--text-dark);
  transition: color 0.2s ease-in-out;
}

.card-title-link:hover {
  color: var(--primary-color);
}

.text-truncate-3-lines {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.border-top-dashed {
  border-top: 1px dashed #376B9EFF !important;
}

.author-avatar {
  width: 32px;
  height: 32px;
  object-fit: cover;
}

/*
  ================================================
  Badges (Categories)
  ================================================
*/
.post-badge {
  background-color: rgba(66, 105, 163, 0.1);
  color: var(--primary-color);
  font-weight: 600;
  padding: .35em .65em;
  border-radius: 50rem;
  transition: all 0.2s ease-in-out;
}

.post-badge:hover {
  background-color: var(--primary-color);
  color: #fff;
}

.post-badge-secondary {
  background-color: rgba(53, 95, 131, 0.1);
  color: var(--secondary-color);
  font-weight: 600;
  padding: .35em .65em;
  border-radius: 50rem;
}
</style>
