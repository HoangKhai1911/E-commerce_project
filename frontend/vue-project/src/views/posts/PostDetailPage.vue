<script setup lang="ts">
import { ref, onMounted, watch, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { usePosts } from '@/composables/usePosts';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Tải component RelatedPosts một cách bất đồng bộ
const RelatedPosts = defineAsyncComponent(() => 
  import('@/components/posts/RelatedPosts.vue')
);

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
const { getPostBySlug, getRelatedPosts, isLoading, error } = usePosts();

const post = ref<Post | null>(null);
const relatedPosts = ref<Post[]>([]);

const fetchPostAndRelated = async () => {
  post.value = null; // Clear previous post
  relatedPosts.value = []; // Clear previous related posts
  error.value = null; // Clear previous errors

  const slug = route.params.slug as string;

  try {
    const fetchedPost = await getPostBySlug(slug);
    post.value = fetchedPost;

    if (fetchedPost && fetchedPost.id) {
        // Fetch related posts using the fetchedPost.id
        const fetchedRelatedPosts = await getRelatedPosts(fetchedPost.id);
        // Filter out the current post from related posts
        relatedPosts.value = fetchedRelatedPosts.filter(rp => rp.id !== fetchedPost.id);
    }
  } catch (err) {
    console.error('Error fetching post or related posts:', err);
    error.value = 'Không thể tải bài viết này.';
  }
};

onMounted(fetchPostAndRelated);
watch(() => route.params.slug, () => {
  fetchPostAndRelated();
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

// Simple HTML sanitizer - for display only, not security
const sanitizeHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  // Remove script tags and potentially harmful attributes
  Array.from(doc.scripts).forEach(script => script.remove());
  Array.from(doc.querySelectorAll('[onerror], [onload], [onmouseover]')).forEach(el => {
    el.removeAttribute('onerror');
    el.removeAttribute('onload');
    el.removeAttribute('onmouseover');
  });
  return doc.body.innerHTML;
};
</script>

<template>
  <div class="container py-5">
    <LoadingSpinner v-if="isLoading && !post" class="my-5" />
    <BaseAlert v-if="error" :message="error" type="danger" class="mb-4" />

    <div v-if="post && !isLoading" class="row justify-content-center">
      <div class="col-lg-9">
        <article class="post-detail-card shadow-sm p-4 p-md-5 bg-white rounded-lg">
          <h1 class="post-title mb-4 text-center fw-bold">{{ post.title }}</h1>

          <div class="post-meta text-muted text-center mb-4">
            <span><i class="bi bi-clock me-1"></i> {{ formatDate(post.publishedAt) }}</span>
            <span v-if="post.source" class="ms-3"><i class="bi bi-person me-1"></i> Nguồn: <a :href="post.source.name" target="_blank" rel="noopener noreferrer" class="text-decoration-none text-primary">{{ post.source.name }}</a></span>
            <span class="ms-3"><i class="bi bi-eye me-1"></i> {{ post.clickCount || 0 }} lượt xem</span>
          </div>

          <figure v-if="post.thumbnail_url" class="post-thumbnail text-center mb-4">
            <img :src="post.thumbnail_url" :alt="post.title" class="img-fluid rounded shadow-sm">
          </figure>

          <div class="post-content fs-5" v-html="sanitizeHtml(post.content)"></div>

          <div class="post-categories mt-5 pt-4 border-top">
            <h6 class="fw-bold mb-3">Danh mục:</h6>
            <RouterLink v-for="category in post.categories" :key="category.slug" :to="`/categories/${category.slug}`" class="badge bg-secondary-subtle text-secondary me-2 mb-2 text-decoration-none">
              {{ category.name }}
            </RouterLink>
          </div>
        </article>
      </div>
    </div>

    <RelatedPosts v-if="relatedPosts.length > 0 && !isLoading" :posts="relatedPosts" />

    <div v-if="!post && !isLoading && !error" class="alert alert-warning text-center my-5" role="alert">
      Không tìm thấy bài viết bạn yêu cầu.
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
        color: darken(var(--bs-primary), 10%);
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