<template>
  <div class="container py-5">
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5">
      <h2 class="text-center text-primary fw-bold mb-3 mb-md-0">
        Danh mục: "{{ categoryName }}"
        <span v-if="!isLoading && totalPosts > 0" class="badge bg-secondary-subtle text-secondary-emphasis fw-normal fs-6 ms-2">
          {{ totalPosts }}
          <span class="d-none d-sm-inline">kết quả</span>
        </span>
      </h2>
      <div class="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3">
        <!-- Filter by Source -->
        <div class="d-flex align-items-center">
          <label for="source-select" class="form-label me-2 mb-0 fw-bold text-muted flex-shrink-0">Nguồn:</label>
          <div v-if="isSourcesLoading" class="placeholder-glow" style="min-width: 150px;">
            <span class="placeholder col-12 form-select form-select-sm"></span>
          </div>
          <select v-else id="source-select" v-model="selectedSource" @change="handleFilterChange" class="form-select form-select-sm shadow-sm border-light">
            <option value="">Tất cả nguồn</option>
            <option v-for="source in sourcesList" :key="source.id" :value="source.id">{{ source.name }}</option>
          </select>
        </div>
        <!-- Sort by -->
        <div class="d-flex align-items-center">
          <label for="sort-select" class="form-label me-2 mb-0 fw-bold text-muted flex-shrink-0">Sắp xếp:</label>
          <select
            id="sort-select"
            v-model="sortBy"
            @change="handleFilterChange"
            class="form-select form-select-sm shadow-sm border-light"
          >
            <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.text }}</option>
          </select>
        </div>
        <!-- Reset Button -->
        <Transition name="fade-fast">
          <button v-if="isFilterActive" @click="resetFilters" class="btn btn-sm btn-outline-secondary ms-md-2" title="Reset bộ lọc" :disabled="isLoading">
            <span v-if="isLoading" class="spinner-border spinner-border-sm" style="width: 1em; height: 1em;" role="status" aria-hidden="true"></span>
            <i v-else class="bi bi-arrow-counterclockwise"></i>
          </button>
        </Transition>
      </div>
    </div>

    <div v-if="isLoading" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="n in pageSize" :key="`skeleton-${n}`">
        <PostCardSkeleton />
      </div>
    </div>

    <BaseAlert v-else-if="error" :message="error" type="danger" class="mb-4" />

    <div v-else-if="posts.length > 0">
      <TransitionGroup tag="div" name="list" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="post in posts" :key="post.id">
          <PostCard :post="post" />
        </div>
      </TransitionGroup>

      <!-- Infinite Scroll Trigger -->
      <div v-if="currentPage < totalPages" ref="observerTarget" class="text-center py-4">
        <div v-if="isAppending" class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-5">
      <h3 class="text-muted">Không tìm thấy bài viết nào trong danh mục này.</h3>
    </div>

    <!-- Scroll to Top Button -->
    <Transition name="fade">
      <button
        v-if="showScrollToTopButton"
        @click="scrollToTop"
        class="btn btn-primary rounded-circle shadow-lg scroll-to-top-btn"
        title="Cuộn lên đầu trang"
      >
        <i class="bi bi-arrow-up"></i>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue';
import PostCard from '@/components/posts/PostCard.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import type { Post, Source, Category } from '@/type';
import api from '@/lib/api';

const route = useRoute();
const isLoading = ref(true);
const error = ref<string | null>(null);

const categorySlug = ref<string>(route.params.slug as string);
const categoryName = ref<string>('');
const posts = ref<Post[]>([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalPosts = ref(0);
const pageSize = 9; // Số lượng bài viết mỗi trang

const sourcesList = ref<Source[]>([]);
const isSourcesLoading = ref(true);
const selectedSource = ref<number | ''>('');
const isAppending = ref(false); // Loading state for the "Load More" button
const observerTarget = ref<HTMLElement | null>(null);
const showScrollToTopButton = ref(false);

let filterDebounceTimer: ReturnType<typeof setTimeout> | null = null;

// 🔴 SỬA LỖI Ở ĐÂY: Thay đổi defaultSortBy từ 'publishedAt:desc' sang 'id:desc'
const defaultSortBy = 'id:desc'; // An toàn hơn để test
const sortBy = ref(defaultSortBy);
const sortOptions = [
  { value: defaultSortBy, text: 'Mới nhất (ID)' }, // Cập nhật text để dễ hiểu
  { value: 'publishedAt:desc', text: 'Mới nhất (Ngày đăng)' }, // Giữ lại option này
  { value: 'clickCount:desc', text: 'Phổ biến nhất' },
  { value: 'title:asc', text: 'Tên (A-Z)' },
  { value: 'title:desc', text: 'Tên (Z-A)' },
];

const isFilterActive = computed(() => {
  return selectedSource.value !== '' || sortBy.value !== defaultSortBy;
});

const getPostsByCategory = async (slug: string, page: number, size: number, sort: string, sourceId: number | '') => {
  const params: any = {
    'populate': ['categories', 'source', 'thumbnail', 'author.avatar'],
    'filters[categories][slug][$eq]': slug,
    'pagination[page]': page,
    'pagination[pageSize]': size,
    'sort': sort,
  };

  if (sourceId) {
    params['filters[source][id][$eq]'] = sourceId;
  }

  const response = await api.get('/posts', { params });
  return response.data;
};

const fetchCategoryName = async (slug: string) => {
  try {
    const response = await api.get('/categories', { params: { 'filters[slug][$eq]': slug } });
    if (response.data.data && response.data.data.length > 0) {
      categoryName.value = response.data.data[0].attributes.name; // Use .attributes.name
    } else {
      categoryName.value = slug; // Fallback to slug if not found
      error.value = `Không tìm thấy danh mục với slug "${slug}".`;
    }
  } catch (err) {
    console.error('Error fetching category name:', err);
    categoryName.value = slug; // Fallback
  }
};

const fetchSources = async () => {
  isSourcesLoading.value = true;
  try {
    // Giả sử API trả về nguồn không phân trang hoặc chúng ta chỉ cần trang đầu tiên
    const response = await api.get('/sources', { params: { 'pagination[limit]': -1, 'sort': 'name:asc' } });
    sourcesList.value = response.data.data.map((item: any) => ({
      id: item.id,
      name: item.attributes.name, // Ánh xạ đúng thuộc tính
    }));
  } catch (err) {
    console.error('Error fetching sources:', err);
    // Không hiển thị lỗi cho người dùng vì đây là bộ lọc không quan trọng
  } finally {
    isSourcesLoading.value = false;
  }
};

const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null; // Clear previous errors
  try {
    // Khi fetch lại từ đầu (do filter, đổi slug), luôn lấy trang 1
    const response = await getPostsByCategory(categorySlug.value, currentPage.value, pageSize, sortBy.value, selectedSource.value);
    
    // Ánh xạ dữ liệu bài viết từ response.data.data
    posts.value = response.data.map((item: any) => ({
      id: item.id,
      title: item.attributes.title,
      slug: item.attributes.slug,
      excerpt: item.attributes.excerpt,
      publishedAt: item.attributes.publishedAt,
      clickCount: item.attributes.clickCount,
      thumbnail: item.attributes.thumbnail?.data?.attributes ? { url: item.attributes.thumbnail.data.attributes.url } : undefined,
      author: item.attributes.author?.data?.attributes ? {
        username: item.attributes.author.data.attributes.username,
        avatar: item.attributes.author.data.attributes.avatar?.data?.attributes ? { url: item.attributes.author.data.attributes.avatar.data.attributes.url } : undefined,
      } : undefined,
      categories: item.attributes.categories?.data?.map((cat: any) => ({
        id: cat.id,
        name: cat.attributes.name,
        slug: cat.attributes.slug,
      })) || [],
      source: item.attributes.source?.data?.attributes ? {
        id: item.attributes.source.data.id,
        name: item.attributes.source.data.attributes.name,
        url: item.attributes.source.data.attributes.url,
      } : undefined,
    }));

    totalPosts.value = response.meta.pagination.total;
    totalPages.value = response.meta.pagination.pageCount;
  } catch (err) {
    console.error('Error fetching category posts:', err);
    error.value = 'Không thể tải bài viết cho danh mục này.';
  } finally {
    isLoading.value = false;
  }
};

const fetchData = async () => {
  // Chạy song song việc lấy tên danh mục và danh sách bài viết để tăng hiệu suất
  await Promise.all([
    fetchSources(),
    fetchCategoryName(categorySlug.value),
    fetchPosts()
  ]);
};

let observer: IntersectionObserver | null = null;

onMounted(() => {
  fetchData();

  observer = new IntersectionObserver(
    (entries) => {
      // Nếu mục tiêu hiển thị và không đang trong quá trình tải thêm
      if (entries[0].isIntersecting && !isAppending.value) {
        loadMorePosts();
      }
    },
    {
      // Bắt đầu tải khi người dùng cuộn còn cách 200px
      rootMargin: '200px',
    }
  );

  if (observerTarget.value) {
    observer.observe(observerTarget.value);
  }

  window.addEventListener('scroll', handleScroll);
});

watch(() => route.params.slug, (newSlug) => {
  if (newSlug && newSlug !== categorySlug.value) {
    categorySlug.value = newSlug as string;
    currentPage.value = 1;
    sortBy.value = defaultSortBy;
    selectedSource.value = ''; // Reset bộ lọc nguồn
    // Xóa bài viết cũ để hiển thị skeleton loader
    posts.value = [];
    totalPosts.value = 0;
    fetchData();
  }
});

const handleFilterChange = () => {
  // Hủy bộ đếm thời gian debounce trước đó nếu có
  if (filterDebounceTimer) {
    clearTimeout(filterDebounceTimer);
  }

  // Đặt một bộ đếm thời gian mới để trì hoãn việc gọi API
  filterDebounceTimer = setTimeout(() => {
    currentPage.value = 1; // Reset về trang đầu tiên khi thay đổi bộ lọc
    fetchPosts();
  }, 500); // Chờ 500ms sau lần thay đổi cuối cùng
};

const resetFilters = () => {
  if (filterDebounceTimer) {
    clearTimeout(filterDebounceTimer);
  }
  selectedSource.value = '';
  sortBy.value = defaultSortBy;
  currentPage.value = 1;
  fetchPosts();
};

const loadMorePosts = async () => {
  if (isAppending.value || currentPage.value >= totalPages.value) return;

  isAppending.value = true;
  try {
    const nextPage = currentPage.value + 1;
    const response = await getPostsByCategory(categorySlug.value, nextPage, pageSize, sortBy.value, selectedSource.value);
    posts.value.push(...response.data); // Nối kết quả mới vào danh sách hiện tại
    currentPage.value = nextPage; // Cập nhật trang hiện tại
  } catch (err) {
    console.error('Error loading more posts:', err);
    // Có thể hiển thị một thông báo lỗi nhỏ ở đây
  } finally {
    isAppending.value = false;
  }
};

const handleScroll = () => {
  showScrollToTopButton.value = window.scrollY > 400;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Theo dõi sự thay đổi của observerTarget để đảm bảo nó luôn được observe
watch(observerTarget, (newTarget, oldTarget) => {
  if (observer) {
    if (oldTarget) {
      observer.unobserve(oldTarget);
    }
    if (newTarget) {
      observer.observe(newTarget);
    }
  }
});

onUnmounted(() => {
  if (observer) observer.disconnect();
  if (filterDebounceTimer) clearTimeout(filterDebounceTimer);
  window.removeEventListener('scroll', handleScroll);
});
</script>

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

/* Transition for the list of posts */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(30px);
}

.scroll-to-top-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s ease;
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}
</style>
