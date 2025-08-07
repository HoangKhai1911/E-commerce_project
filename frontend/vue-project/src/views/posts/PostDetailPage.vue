<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePosts } from '@/composables/usePosts';
import PostCard from '@/components/posts/PostCard.vue';
import PostDetailSkeleton from '@/components/posts/PostDetailSkeleton.vue';
import DOMPurify from 'dompurify';
import { useSeoMeta } from '@vueuse/head';

// Thêm interface để định nghĩa cấu trúc dữ liệu cho bài viết, giúp code an toàn và dễ bảo trì hơn.
interface Author {
  id: number;
  username: string;
  avatar?: { url: string };
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
  content?: string;
  excerpt?: string;
  publishedAt: string;
  image?: {
    url: string;
    alternativeText?: string;
  }[];
  author?: Author;
  categories?: Category[];
  source?: {
    name?: string;
    url?: string;
  };
}

const route = useRoute();
const { getPostBySlug, getRelatedPosts } = usePosts();

const post = ref<Post | null>(null);
const relatedPosts = ref<Post[]>([]);
const isLoading = ref(true);
const isPostFound = ref(true);

const fetchPostAndRelated = async (slug: string) => {
  isLoading.value = true;
  isPostFound.value = true;
  post.value = null;

  try {
    const fetchedPost = await getPostBySlug(slug);
    post.value = fetchedPost;

    if (!fetchedPost) {
      isPostFound.value = false;
      isLoading.value = false;
      return;
    }

    if (post.value) {
      // Cập nhật meta SEO sau khi có dữ liệu post
      useSeoMeta({
        title: `${post.value.title} - MyBlog`,
        description: post.value.excerpt || post.value.title,
      });
    }

    const fetchedRelatedPosts = await getRelatedPosts(fetchedPost.id);
    relatedPosts.value = fetchedRelatedPosts.filter(p => p.id !== fetchedPost.id);
  } catch (err: any) {
    console.error('Error fetching post or related posts:', err);
    if (err.response && err.response.status === 404) {
      isPostFound.value = false;
    }
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => route.params.slug,
  async (newSlug) => {
    if (newSlug) {
      await fetchPostAndRelated(newSlug as string);
    }
  },
  { immediate: true }
);

const sanitizedContent = computed(() => {
  if (!post.value || !post.value.content) return '';
  return DOMPurify.sanitize(post.value.content);
});
</script>

<template>
  <div class="bg-light">
    <div class="container py-5">
      <!-- Skeleton Loader -->
      <PostDetailSkeleton v-if="isLoading" />

      <!-- Not Found Message -->
      <div v-else-if="!isPostFound" class="text-center py-5">
        <h1 class="display-4">404 - Bài viết không tồn tại</h1>
        <p class="lead text-muted">Rất tiếc, chúng tôi không thể tìm thấy bài viết bạn yêu cầu.</p>
        <RouterLink to="/" class="btn btn-primary mt-3">Quay về trang chủ</RouterLink>
      </div>

      <!-- Post Detail -->
      <div v-else-if="post" class="row justify-content-center">
        <div class="col-lg-9">
          <article class="post-detail-card shadow-sm p-4 p-md-5 bg-white rounded-lg">
            <h1 class="post-title fw-bolder mb-3 text-center">{{ post.title }}</h1>

            <!-- Post Meta -->
            <div class="post-meta text-center mb-4 d-flex align-items-center justify-content-center flex-wrap gap-3">
              <span v-if="post.author" class="author">
                <i class="bi bi-person-fill me-1"></i>
                {{ post.author.username }}
              </span>
              <span class="published-date">
                <i class="bi bi-calendar3 me-1"></i>
                {{ new Date(post.publishedAt).toLocaleDateString('vi-VN') }}
              </span>
              <span v-if="post.categories && post.categories.length" class="categories">
                <i class="bi bi-tag-fill me-1"></i>
                <template v-for="(category, index) in post.categories" :key="category.id">
                  <RouterLink :to="{ name: 'CategoryDetail', params: { slug: category.slug } }" class="text-decoration-none text-primary">
                    {{ category.name }}
                  </RouterLink>
                  <span v-if="index < post.categories.length - 1">, </span>
                </template>
              </span>
            </div>

            <!-- Post Thumbnail -->
            <div v-if="post.image && post.image.length > 0 && post.image[0].url" class="post-thumbnail my-4 text-center">
              <img 
                :src="post.image[0].url" 
                :alt="post.image[0].alternativeText || post.title" 
                class="img-fluid rounded shadow-sm"
              >
            </div>

            <!-- Nội dung bài viết -->
            <div class="post-content fs-5" v-html="sanitizedContent"></div>

            <!-- Nguồn bài viết -->
            <div v-if="post.source?.url" class="post-source mt-4 pt-4 border-top text-muted">
              <p class="mb-0">
                <i class="bi bi-link-45deg"></i>
                Nguồn bài viết: 
                <a :href="post.source.url" target="_blank" rel="noopener noreferrer" class="text-decoration-underline">
                  {{ post.source.name || post.source.url }}
                </a>
              </p>
            </div>
          </article>
        </div>
      </div>

      <!-- Related Posts -->
      <div v-if="relatedPosts.length" class="mt-5">
        <h4 class="mb-4">Bài viết liên quan</h4>
        <div class="row g-4">
          <div class="col-md-4" v-for="related in relatedPosts" :key="related.id">
            <PostCard :post="related" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.post-detail-card {
  border-radius: var(--bs-border-radius-lg);
  .post-title {
    font-size: 2.5rem;
    line-height: 1.2;
    color: var(--bs-dark);
  }
  .post-meta {
    font-size: 0.9rem;
    color: var(--bs-gray-600);
    span {
      display: inline-flex;
      align-items: center;
      i {
        font-size: 1rem;
        vertical-align: middle;
      }
    }
  }
  .post-thumbnail {
    img {
      max-height: 450px;
      object-fit: contain; // Changed to contain to avoid cropping large images
      width: 100%;
    }
  }
  .post-content {
    line-height: 1.8;
    color: var(--bs-body-color);

    // Basic styling for HTML content from Strapi
    :deep(p) { // Use :deep() for styling content injected via v-html
      margin-bottom: 1rem;
    }
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin-top: 1.5rem;
      margin-bottom: 1rem;
      font-weight: bold;
      color: var(--bs-dark);
    }
    :deep(img) {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 1.5rem auto;
      border-radius: var(--bs-border-radius-sm);
      box-shadow: var(--bs-box-shadow-sm);
    }
    :deep(a) {
      color: var(--bs-primary);
      text-decoration: underline;
      &:hover {
        color: rgba(13, 110, 253, 0.8); // hoặc tự chọn màu hover thủ công
      }
    }
    :deep(ul), :deep(ol) {
      margin-bottom: 1rem;
      padding-left: 1.5rem;
    }
    :deep(strong) {
      font-weight: bold;
    }
    :deep(em) {
      font-style: italic;
    }
    :deep(blockquote) {
      border-left: 4px solid var(--bs-primary);
      padding-left: 1.25rem;
      margin: 1.5rem 0;
      color: var(--bs-gray-700);
      font-style: italic;
    }
    :deep(pre), :deep(code) {
      background-color: var(--bs-light);
      padding: 0.75rem;
      border-radius: var(--bs-border-radius-sm);
      font-family: monospace;
      font-size: 0.9rem;
      overflow-x: auto;
    }
    :deep(table) {
        width: 100%;
        margin-bottom: 1rem;
        border-collapse: collapse;
        th, td {
            border: 1px solid var(--bs-border-color);
            padding: 0.75rem;
            vertical-align: top;
        }
        th {
            background-color: var(--bs-light);
            font-weight: bold;
            text-align: left;
        }
    }
  }

  .post-categories .badge {
    font-size: 0.85rem;
    padding: 0.5em 0.9em;
  }
}
</style>