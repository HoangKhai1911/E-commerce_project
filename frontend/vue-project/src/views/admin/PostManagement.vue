<template>
  <div>
    <h1 class="mb-4">Quản lý Bài viết</h1>

    <LoadingSpinner v-if="isLoading" />
    <BaseAlert v-if="error" :message="error" type="danger" />

    <div v-if="!isLoading && posts.length > 0" class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tiêu đề</th>
              <th>Tác giả</th>
              <th>Ngày đăng</th>
              <th class="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="post in posts" :key="post.id">
              <td>{{ post.id }}</td>
              <td>
                <router-link :to="{ name: 'PostDetail', params: { slug: post.slug } }" class="text-decoration-none" target="_blank">
                  {{ post.title }}
                </router-link>
              </td>
              <td>{{ post.author?.username || 'N/A' }}</td>
              <td>{{ formatDate(post.publishedAt) }}</td>
              <td class="text-end">
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
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePosts } from '@/composables/usePosts';
import { adminService } from '@/services/adminService'; // Giả định service này tồn tại
import { useUiStore } from '@/store/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BasePagination from '@/components/ui/BasePagination.vue';

// Các kiểu dữ liệu này nên được đặt ở file chung, ví dụ: src/type/index.ts
interface PostAuthor {
  id: number;
  username: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  author?: PostAuthor;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

const router = useRouter();
const uiStore = useUiStore();
const { fetchLatestPosts } = usePosts();

const posts = ref<Post[]>([]);
const meta = ref<PaginationMeta | null>(null);
const currentPage = ref(1);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchPosts = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await fetchLatestPosts(currentPage.value, 10); // Lấy 10 bài viết mỗi trang
    posts.value = response.data;
    meta.value = response.meta.pagination;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    error.value = 'Không thể tải danh sách bài viết: ' + message;
    console.error('Error fetching posts:', err);
  } finally {
    isLoading.value = false;
  }
};

watch(currentPage, fetchPosts);

onMounted(fetchPosts);

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const editPost = (postId: number) => {
  // Chuyển hướng đến trang chỉnh sửa bài viết (bạn cần tạo route và component này)
  router.push({ name: 'AdminPostEdit', params: { id: postId } });
};

const deletePost = async (postId: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
    try {
      await adminService.deletePost(postId); // Giả định adminService có hàm này
      uiStore.addAlert('Xóa bài viết thành công!', 'success');
      // Tải lại danh sách bài viết ở trang hiện tại
      await fetchPosts();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      uiStore.addAlert('Xóa bài viết thất bại: ' + message, 'danger');
      console.error('Error deleting post:', err);
    }
  }
};
</script>