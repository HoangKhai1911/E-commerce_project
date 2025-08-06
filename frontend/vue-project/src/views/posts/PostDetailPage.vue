<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePosts } from '@/composables/usePosts';
import PostCard from '@/components/posts/PostCard.vue';
// import MarkdownIt from 'markdown-it'; // <-- BỎ DÒNG NÀY (nếu content là HTML)
import DOMPurify from 'dompurify';
import { useSeoMeta } from '@vueuse/head';

// const md = new MarkdownIt(); // <-- BỎ DÒNG NÀY

const route = useRoute();
const { getPostBySlug, getRelatedPosts } = usePosts();

const post = ref<any>(null);
const relatedPosts = ref<any[]>([]);
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

    // Cập nhật meta SEO sau khi có dữ liệu post
    useSeoMeta({
      title: `${post.value.title} - Tên Blog của bạn`,
      description: post.value.excerpt || post.value.title,
      // Thêm các thẻ meta khác nếu cần
    });

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

onMounted(() => {
  console.log('--- Post data on component mount ---');
  console.log('Post object:', post.value);
  console.log('Content (raw):', post.value?.content);
  // THAY ĐỔI DÒNG NÀY:
  // console.log('Content (sanitized & rendered):', DOMPurify.sanitize(md.render(post.value?.content || '')));
  // BẰNG DÒNG NÀY:
  console.log('Content (sanitized):', DOMPurify.sanitize(post.value?.content || '')); // Chỉ sanitize HTML
  console.log('Thumbnail URL:', post.value?.thumbnail?.url);
  console.log('Source URL:', post.value?.source?.url);
  console.log('------------------------------------');
});
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="isLoading" class="text-center">Loading...</div>
    <div v-else-if="!isPostFound" class="text-center text-red-500">Không tìm thấy bài viết.</div>
    <div v-else-if="post" class="flex flex-col lg:flex-row gap-8">
      <!-- Main Content -->
      <main class="w-full lg:w-2/3">
        <h1 class="text-3xl font-bold mb-4">{{ post.title }}</h1>
        <div class="text-gray-500 text-sm mb-4">
          Ngày đăng: {{ new Date(post.publishedAt).toLocaleDateString() }}
          <span v-if="post.author">bởi {{ post.author.username }}</span>
        </div>
        
        <!-- Hiển thị nội dung bài viết -->
        <div class="prose max-w-none">
          <!-- THAY ĐỔI DÒNG NÀY: -->
          <!-- <div v-html="DOMPurify.sanitize(md.render(post.content || ''))"></div> -->
          <!-- BẰNG DÒNG NÀY: -->
          <div v-html="DOMPurify.sanitize(post.content || '')"></div>
        </div>
        
        <!-- Hiển thị Nguồn bài viết -->
        <div v-if="post.source?.url" class="mt-4 text-sm text-gray-600">
          Nguồn bài gốc: 
          <a :href="post.source.url" target="_blank" class="text-blue-500 hover:underline">
            {{ post.source.name || post.source.url }}
          </a>
        </div>
      </main>

      <!-- Sidebar for Related Posts -->
      <aside class="w-full lg:w-1/3">
        <h2 class="text-xl font-bold mb-4">Bài viết liên quan</h2>
        <div v-if="relatedPosts.length" class="space-y-4">
          <PostCard v-for="p in relatedPosts" :key="p.id" :post="p" />
        </div>
        <div v-else class="text-gray-500">Không có bài viết liên quan.</div>
      </aside>
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