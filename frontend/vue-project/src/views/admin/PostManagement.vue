<template>
  <div>
    <h1 class="mb-4">Quản lý Bài viết</h1>

    <!-- Filter Controls -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <label for="searchFilter" class="form-label">Tìm theo tiêu đề</label>
            <input type="text" id="searchFilter" class="form-control" v-model="searchQuery" placeholder="Nhập từ khóa..." :disabled="isLoading" />
          </div>
          <div class="col-md-3">
            <label for="categoryFilter" class="form-label">Lọc theo danh mục</label>
            <select id="categoryFilter" class="form-select" v-model="selectedCategory" :disabled="isLoadingFilters || isLoading">
              <option value="">Tất cả danh mục</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <label for="statusFilter" class="form-label">Trạng thái</label>
            <select id="statusFilter" class="form-select" v-model="selectedStatus" :disabled="isLoading">
              <option value="">Tất cả</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
          <div class="col-md-3">
            <label for="authorFilter" class="form-label">Lọc theo tác giả</label>
            <select id="authorFilter" class="form-select" v-model="selectedAuthor" :disabled="isLoadingFilters || isLoading">
              <option value="">Tất cả tác giả</option>
              <option v-for="author in authors" :key="author.id" :value="author.id">
                {{ author.username }}
              </option>
            </select>
          </div>
          <div class="col-md-4">
            <label for="sortFilter" class="form-label">Sắp xếp theo</label>
            <select id="sortFilter" class="form-select" v-model="selectedSort" :disabled="isLoading">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>
          <div class="col-md-2 align-self-end">
            <BaseButton @click="resetFilters" class="btn-secondary w-100" :disabled="isLoading">
              <i class="bi bi-arrow-clockwise me-2"></i>Xóa bộ lọc
            </BaseButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedPostIds.length > 0" class="mb-3">
      <BaseButton @click="handleBulkDelete" class="btn-danger">
        <i class="bi bi-trash me-2"></i>
        Xóa {{ selectedPostIds.length }} bài viết đã chọn
      </BaseButton>
    </div>

    <LoadingSpinner v-if="isLoading" />
    <BaseAlert v-if="error" :message="error" type="danger" />

    <div v-if="!isLoading && posts.length > 0" class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  class="form-check-input"
                  @change="toggleSelectAll"
                  :checked="isAllSelected"
                  :disabled="posts.length === 0"
                  title="Chọn tất cả trên trang này"
                />
              </th>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th class="text-center">Lượt xem</th>
              <th>Tác giả</th>
              <th>Ngày cập nhật</th>
              <th>Trạng thái</th>
              <th class="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td>
                <input type="checkbox" class="form-check-input" :value="post.id" v-model="selectedPostIds" />
              </td>
              <td>{{ post.id }}</td>
              <td>
                <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="text-decoration-none" target="_blank">
                  {{ post.title }}
                </router-link>
              </td>
              <td class="text-center">{{ post.clickCount != null ? post.clickCount : 0 }}</td>
              <td>{{ post.author?.username || 'N/A' }}</td>
              <td>{{ formatDate(post.updatedAt) }}</td>
              <td>
                <span :class="['badge', post.publishedAt ? 'bg-success' : 'bg-secondary']">
                  {{ post.publishedAt ? 'Đã xuất bản' : 'Bản nháp' }}
                </span>
              </td>
              <td class="text-end">
                <BaseButton 
                  v-if="post.publishedAt"
                  @click="togglePublishStatus(post)" 
                  class="btn-sm btn-outline-warning me-2" 
                  title="Bỏ xuất bản">
                  <i class="bi bi-eye-slash"></i>
                </BaseButton>
                <BaseButton v-else @click="togglePublishStatus(post)" class="btn-sm btn-outline-success me-2" title="Xuất bản">
                  <i class="bi bi-eye"></i>
                </BaseButton>
                <BaseButton @click="editPost(post.id)" class="btn-sm btn-outline-secondary me-2" title="Chỉnh sửa">
                  <i class="bi bi-pencil"></i>
                </BaseButton>
                <BaseButton @click="deletePost(post.id)" class="btn-sm btn-outline-danger" title="Xóa">
                  <i class="bi bi-trash"></i>
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="card-footer bg-light" v-if="meta">
        <BasePagination :meta="meta" v-model="currentPage" />
      </div>
    </div>
    
    <div v-else-if="!isLoading && posts.length === 0">
      <BaseAlert message="Không tìm thấy bài viết nào." type="info" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/lib/api'; // Import apiClient để gọi API trực tiếp
import { useUiStore } from '@/store/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BasePagination from '@/components/ui/BasePagination.vue';

// Các kiểu dữ liệu này nên được đặt ở file chung, ví dụ: src/type/index.ts
interface Author {
  id: number;
  username: string;
}

interface Category {
  id: number;
  name: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  clickCount?: number; // Thêm trường clickCount
  author?: Author;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

interface StrapiFilters {
  [key: string]: {
    [key: string]: any;
  };
}

const router = useRouter();
const uiStore = useUiStore();

const posts = ref<Post[]>([]);
const meta = ref<PaginationMeta | null>(null);
const currentPage = ref(1);
const isLoading = ref(true);
const error = ref<string | null>(null);

// State cho bộ lọc
const categories = ref<Category[]>([]);
const authors = ref<Author[]>([]);
const selectedCategory = ref<string | number>('');
const selectedAuthor = ref<string | number>('');
const searchQuery = ref('');
const selectedStatus = ref(''); // State cho bộ lọc trạng thái
let debounceTimer: number | null = null;
const isLoadingFilters = ref(true);

// State cho sắp xếp bằng dropdown
const sortOptions = ref([
  { value: 'updatedAt:desc', label: 'Ngày cập nhật (Mới nhất)' },
  { value: 'updatedAt:asc', label: 'Ngày cập nhật (Cũ nhất)' },
  { value: 'title:asc', label: 'Tiêu đề (A-Z)' },
  { value: 'title:desc', label: 'Tiêu đề (Z-A)' },
  { value: 'clickCount:desc', label: 'Lượt xem (Nhiều nhất)' },
  { value: 'clickCount:asc', label: 'Lượt xem (Ít nhất)' },
]);
const selectedSort = ref('updatedAt:desc');

// State cho chọn nhiều (bulk selection)
const selectedPostIds = ref<number[]>([]);

// Computed property để kiểm tra xem tất cả bài viết trên trang hiện tại có được chọn không
const isAllSelected = computed(() => {
  if (posts.value.length === 0) return false;
  const postIdsOnPage = posts.value.map(p => p.id);
  return postIdsOnPage.every(id => selectedPostIds.value.includes(id));
});

// Hàm để chọn/bỏ chọn tất cả bài viết trên trang hiện tại
const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const postIdsOnPage = posts.value.map(p => p.id);

  if (target.checked) {
    // Thêm tất cả ID của trang hiện tại vào danh sách chọn (tránh trùng lặp)
    selectedPostIds.value = [...new Set([...selectedPostIds.value, ...postIdsOnPage])];
  } else {
    // Xóa tất cả ID của trang hiện tại khỏi danh sách chọn
    selectedPostIds.value = selectedPostIds.value.filter(id => !postIdsOnPage.includes(id));
  }
};

// Hàm xử lý xóa nhiều bài viết
const handleBulkDelete = async () => {
  if (selectedPostIds.value.length === 0) return;

  if (
    confirm(
      `Bạn có chắc chắn muốn xóa ${selectedPostIds.value.length} bài viết đã chọn không? Hành động này không thể hoàn tác.`
    )
  ) {
    try {
      const numToDelete = selectedPostIds.value.length;
      // Gọi API đã tạo ở backend
      await apiClient.post('/admin/posts/bulk-delete', { ids: selectedPostIds.value });
      uiStore.addAlert('Xóa các bài viết đã chọn thành công!', 'success');
      selectedPostIds.value = []; // Xóa danh sách đã chọn sau khi thành công
      // Cải thiện UX: Nếu xóa hết bài viết trên trang, quay về trang trước đó
      if (posts.value.length === numToDelete && currentPage.value > 1) {
        currentPage.value--; // Watcher sẽ tự động gọi fetchPosts
      } else {
        await fetchPosts();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      uiStore.addAlert('Xóa hàng loạt thất bại: ' + message, 'danger');
      console.error('Error during bulk delete:', err);
    }
  }
};

// Hàm lấy dữ liệu cho các bộ lọc (danh mục, tác giả)
const fetchFilterData = async () => {
  isLoadingFilters.value = true;
  try {
    const [categoriesResponse, authorsResponse] = await Promise.all([
      apiClient.get('/categories', { params: { pagination: { limit: -1 } } }),
      apiClient.get('/users', { params: { pagination: { limit: -1 } } })
    ]);

    categories.value = categoriesResponse.data.data.map((cat: any) => ({ id: cat.id, name: cat.attributes.name }));
    // Strapi v4 /api/users trả về một mảng người dùng trực tiếp
    authors.value = authorsResponse.data.map((author: any) => ({ id: author.id, username: author.username }));

  } catch (err) {
    console.error('Không thể tải dữ liệu bộ lọc:', err);
    uiStore.addAlert('Không thể tải dữ liệu cho bộ lọc.', 'warning');
  } finally {
    isLoadingFilters.value = false;
  }
};

const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null;

  // Xây dựng đối tượng filters để gửi lên API
  const filters: StrapiFilters = {};
  if (selectedCategory.value) {
    filters.categories = { id: { $eq: selectedCategory.value } };
  }
  if (selectedAuthor.value) {
    filters.author = { id: { $eq: selectedAuthor.value } };
  }
  if (searchQuery.value.trim()) {
    filters.title = { $containsi: searchQuery.value.trim() };
  }

  // Thêm bộ lọc trạng thái
  if (selectedStatus.value === 'published') {
    filters.publishedAt = { $notNull: true };
  } else if (selectedStatus.value === 'draft') {
    filters.publishedAt = { $null: true };
  }

  // Xây dựng chuỗi sắp xếp cho API
  const sortString = selectedSort.value;

  try {
    // Gọi API với các tham số phân trang, populate và lọc
    const response = await apiClient.get('/posts', {
      params: {
        publicationState: 'preview', // Lấy cả bài nháp và bài đã xuất bản
        populate: ['author'],
        sort: [sortString],
        pagination: {
          page: currentPage.value,
          pageSize: 10,
        },
        filters,
      }
    });
    // Xử lý dữ liệu trả về từ API
    posts.value = response.data.data.map((post: any) => ({
      id: post.id,
      ...post.attributes,
      author: post.attributes.author?.data?.attributes
    }));
    meta.value = response.data.meta.pagination;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    error.value = 'Không thể tải danh sách bài viết: ' + message;
    console.error('Error fetching posts:', err);
  } finally {
    isLoading.value = false;
  }
};

const resetFilters = () => {
  selectedCategory.value = '';
  selectedAuthor.value = '';
  searchQuery.value = '';
  selectedStatus.value = '';
  selectedSort.value = 'updatedAt:desc';
  // Watcher sẽ tự động gọi lại fetchPosts
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const editPost = (postId: number) => {
  // Chuyển hướng đến trang chỉnh sửa bài viết.
  // Lỗi "No match for..." xảy ra nếu route với name: 'AdminPostEdit' chưa được định nghĩa trong file router.
  router.push({ name: 'AdminPostEdit', params: { id: postId } });
};

const previewPost = (postId: number) => {
  const routeData = router.resolve({ name: 'AdminPostPreview', params: { id: postId } });
  window.open(routeData.href, '_blank');
};

const togglePublishStatus = async (post: Post) => {
  const action = post.publishedAt ? 'bỏ xuất bản' : 'xuất bản';
  const postTitle = post.title.length > 50 ? `${post.title.substring(0, 50)}...` : post.title;

  if (confirm(`Bạn có chắc muốn ${action} bài viết "${postTitle}" không?`)) {
    try {
      // Sửa lỗi: Sử dụng phương thức PUT và cập nhật trường `publishedAt`.
      // Đây là cách làm chuẩn và đáng tin cậy nhất của Strapi Content API.
      const newPublishedAt = post.publishedAt ? null : new Date().toISOString();

      const response = await apiClient.put(`/posts/${post.id}`, {
        data: { publishedAt: newPublishedAt }
      });
      
      // Cập nhật trạng thái của bài viết trong danh sách hiện tại để giao diện phản hồi ngay lập tức
      const updatedPostData = response.data.data.attributes;
      const index = posts.value.findIndex(p => p.id === post.id);
      if (index !== -1) {
        posts.value[index].publishedAt = updatedPostData.publishedAt;
        posts.value[index].updatedAt = updatedPostData.updatedAt; // Ngày cập nhật cũng thay đổi
      }
      uiStore.addAlert(`Đã ${action} bài viết thành công!`, 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      uiStore.addAlert(`Thao tác thất bại: ${message}`, 'danger');
      console.error('Error toggling post status:', err);
    }
  }
};

const deletePost = async (postId: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
    // Thay đổi: Gọi trực tiếp đến endpoint DELETE /api/posts/:id chuẩn
    try {
      await apiClient.delete(`/posts/${postId}`);
      uiStore.addAlert('Xóa bài viết thành công!', 'success');
      // Cải thiện UX: Nếu xóa bài viết cuối cùng trên trang, quay về trang trước đó
      if (posts.value.length === 1 && currentPage.value > 1) {
        currentPage.value--; // Watcher sẽ tự động gọi fetchPosts
      } else {
        await fetchPosts();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      uiStore.addAlert('Xóa bài viết thất bại: ' + message, 'danger');
      console.error('Error deleting post:', err);
    }
  }
};

// Theo dõi sự thay đổi của bộ lọc select (category, author)
watch([selectedCategory, selectedAuthor, selectedStatus, selectedSort], () => {
  if (currentPage.value !== 1) {
    // Chuyển về trang 1 sẽ tự động kích hoạt watcher của currentPage để tải lại dữ liệu
    currentPage.value = 1;
  } else {
    // Nếu đang ở trang 1, watcher của currentPage sẽ không kích hoạt, nên cần gọi thủ công
    fetchPosts();
  }
});

// Theo dõi sự thay đổi của ô tìm kiếm với debounce
watch(searchQuery, () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => {
    if (currentPage.value !== 1) {
      currentPage.value = 1;
    } else {
      fetchPosts();
    }
  }, 500); // Chờ 500ms sau khi người dùng ngừng gõ
});

// Theo dõi sự thay đổi của trang (pagination)
watch(currentPage, fetchPosts);

onMounted(() => {
  fetchFilterData();
  fetchPosts();
});
</script>