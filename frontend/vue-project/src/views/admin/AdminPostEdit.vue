<template>
  <div>
    <h1 class="mb-4">{{ postData?.title ? `Chỉnh sửa: ${postData.title}` : `Chỉnh sửa bài viết #${id}` }}</h1>
    <LoadingSpinner v-if="isLoading" />
    <BaseAlert v-else-if="error" :message="error" type="danger" />
    <form v-else-if="postData" @submit.prevent="savePost">
      <div class="card shadow-sm">
        <div class="card-body">
          <div class="mb-3">
            <label for="postTitle" class="form-label">Tiêu đề</label>
            <input type="text" class="form-control" id="postTitle" v-model="postData.title">
          </div>
          <div class="mb-3">
            <label for="postContent" class="form-label">Nội dung</label>
            <textarea class="form-control" id="postContent" v-model="postData.content" rows="10" placeholder="Nội dung bài viết..."></textarea>
          </div>
          <!-- Thêm phần upload ảnh -->
          <div class="mb-3">
            <label class="form-label">Ảnh bìa</label>
            <ImageUploader :current-image-url="currentImageUrl" @file-selected="onFileSelected" />
          </div>
          <div class="mb-3">
            <label for="postCategory" class="form-label">Danh mục</label>
            <select id="postCategory" class="form-select" v-model="selectedCategoryId" :disabled="isLoading">
              <option :value="null">-- Bỏ chọn danh mục --</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="card-footer bg-light">
          <BaseButton type="submit" class="btn-primary" :disabled="isSaving">
            <span v-if="isSaving" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            Lưu thay đổi
          </BaseButton>
          <BaseButton type="button" class="btn-secondary ms-2" @click="cancelEdit">Hủy</BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import apiClient from '@/lib/api';
import { useUiStore } from '@/store/ui';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import ImageUploader from '@/components/admin/ImageUploader.vue'; // Import component mới

interface PostData {
  title: string;
  content: string;
  // Thêm trường image, là một mảng các đối tượng ảnh
  image?: {
    id: number;
    url: string;
  }[];
}

interface Category {
  id: number;
  name: string;
}

const router = useRouter();
const uiStore = useUiStore();

// Sử dụng defineProps để nhận `id` từ router, giúp component độc lập hơn.
// Điều này hoạt động được nhờ `props: true` trong file cấu hình router.
const props = defineProps<{
  id: string;
}>();

const postData = ref<PostData | null>(null);
const categories = ref<Category[]>([]);
const selectedCategoryId = ref<number | null>(null);
const newImageFile = ref<File | null>(null); // Ref để lưu file ảnh mới
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref<string | null>(null);

// Computed property để lấy URL ảnh hiện tại
const currentImageUrl = computed(() => {
  return postData.value?.image?.[0]?.url || null;
});

// Hàm được gọi khi người dùng chọn một file mới
const onFileSelected = (file: File | null) => {
  newImageFile.value = file;
};

onMounted(async () => {
  try {
    // Lấy dữ liệu bài viết và danh sách danh mục cùng lúc để tăng hiệu suất
    const [postResponse, categoriesResponse] = await Promise.all([
      // Populate cả 'image' và 'categories'
      apiClient.get(`/posts/${props.id}?populate[image]=*&populate[categories]=*`),
      apiClient.get('/categories', { params: { pagination: { limit: -1 } } })
    ]);

    // Gán dữ liệu cho form
    postData.value = postResponse.data.data.attributes;
    
    // Gán danh sách danh mục cho ô chọn
    categories.value = categoriesResponse.data.data.map((cat: any) => ({ id: cat.id, ...cat.attributes }));

    // Thiết lập giá trị danh mục hiện tại của bài viết
    // Lấy ID của danh mục đầu tiên nếu có
    selectedCategoryId.value = postResponse.data.data.attributes.categories?.data[0]?.id || null;
  } catch (err) {
    error.value = 'Không thể tải dữ liệu bài viết.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
});

const savePost = async () => {
  if (!postData.value) return;
  isSaving.value = true;
  try {
    const payload = {
      title: postData.value.title,
      content: postData.value.content,
      categories: selectedCategoryId.value ? [selectedCategoryId.value] : [],
    };

    // Nếu có file ảnh mới, chúng ta phải gửi request dưới dạng multipart/form-data
    if (newImageFile.value) {
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      formData.append('files.image', newImageFile.value);

      // Axios sẽ tự động đặt Content-Type là multipart/form-data
      await apiClient.put(`/posts/${props.id}`, formData);
    } else {
      // Nếu không có file mới, chỉ cần gửi request JSON thông thường
      await apiClient.put(`/posts/${props.id}`, { data: payload });
    }

    uiStore.addAlert(`Cập nhật bài viết "${postData.value.title}" thành công!`, 'success');
    router.push({ name: 'PostManagement' });
  } catch (err: any) {
    const message = err.response?.data?.error?.message || err.message || 'Lỗi không xác định';
    uiStore.addAlert('Cập nhật thất bại: ' + message, 'danger');
    console.error('Error saving post:', err);
  } finally {
    isSaving.value = false;
  }
};

const cancelEdit = () => {
  router.push({ name: 'PostManagement' });
};
</script>