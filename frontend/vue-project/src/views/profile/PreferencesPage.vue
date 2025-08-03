<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useApi } from '@/composables/useApi';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

interface Category {
  id: number;
  name: string;
  slug: string;
}

const authStore = useAuthStore();
const api = useApi();

const allCategories = ref<Category[]>([]);
const selectedInterests = ref<number[]>([]); // Mảng ID của các danh mục đã chọn
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

onMounted(async () => {
  try {
    // 1. Lấy tất cả các danh mục
    const categoriesResponse = await api.get('/categories'); // Sử dụng API bạn đã định nghĩa cho Category
    // API Strapi thường trả về { data: [...] } cho collection types
    allCategories.value = categoriesResponse.data.data;

    // 2. Lấy sở thích hiện tại của người dùng
    const preferencesResponse = await api.get('/user-preferences'); // Sử dụng API bạn đã định nghĩa cho user-preferences
    // API user-preferences trả về mảng category objects
    selectedInterests.value = preferencesResponse.data.data.map((cat: Category) => cat.id);

  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Không thể tải sở thích hoặc danh mục.';
    console.error('Error fetching preferences/categories:', err);
  } finally {
    isLoading.value = false;
  }
});

const toggleInterest = (categoryId: number) => {
  const index = selectedInterests.value.indexOf(categoryId);
  if (index > -1) {
    selectedInterests.value.splice(index, 1); // Bỏ chọn
  } else {
    selectedInterests.value.push(categoryId); // Chọn
  }
};

const handleSavePreferences = async () => {
  errorMessage.value = null;
  successMessage.value = null;
  isSaving.value = true;

  if (selectedInterests.value.length < 3 || selectedInterests.value.length > 5) {
    errorMessage.value = 'Vui lòng chọn tối thiểu 3 và tối đa 5 chủ đề yêu thích.';
    isSaving.value = false;
    return;
  }

  try {
    await api.put('/user-preferences', { interests: selectedInterests.value });
    successMessage.value = 'Sở thích của bạn đã được cập nhật thành công!';
    // Sau khi lưu, có thể cập nhật lại authStore để đồng bộ
    await authStore.fetchUser();
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Lưu sở thích thất bại.';
    console.error('Error saving preferences:', err);
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-10">
        <h2 class="mb-4 text-center text-primary fw-bold">Quản lý sở thích</h2>
        <p class="text-center text-muted mb-5">
          Chọn tối thiểu 3 và tối đa 5 chủ đề bạn quan tâm để nhận được những bài viết đề xuất phù hợp nhất.
        </p>

        <LoadingSpinner v-if="isLoading" class="my-5" />
        <BaseAlert v-if="errorMessage" :message="errorMessage" type="danger" class="mb-4" />
        <BaseAlert v-if="successMessage" :message="successMessage" type="success" class="mb-4" />

        <div v-if="!isLoading" class="card shadow-sm p-4">
          <div class="d-flex flex-wrap justify-content-center">
            <div
              v-for="category in allCategories"
              :key="category.id"
              @click="toggleInterest(category.id)"
              class="category-tag me-3 mb-3 p-3 rounded-pill text-center d-flex align-items-center justify-content-center cursor-pointer transition-ease"
              :class="{ 'selected': selectedInterests.includes(category.id) }"
            >
              {{ category.name }}
            </div>
          </div>

          <div class="text-center mt-4">
            <BaseButton
              @click="handleSavePreferences"
              :loading="isSaving"
              class="btn-primary btn-lg"
              :disabled="selectedInterests.length < 3 || selectedInterests.length > 5"
            >
              Lưu sở thích
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.category-tag {
  border: 2px solid var(--bs-gray-300);
  background-color: var(--bs-light);
  color: var(--bs-dark);
  font-weight: 500;
  min-width: 120px; // Đảm bảo kích thước tối thiểu
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease-in-out;

  &:hover {
    border-color: var(--bs-primary);
    background-color: var(--bs-primary-bg-subtle);
  }

  &.selected {
    background-color: var(--bs-primary);
    color: var(--bs-white);
    border-color: var(--bs-primary);
    box-shadow: 0 0.25rem 0.5rem rgba(var(--bs-primary-rgb), 0.2);
    transform: translateY(-2px);
  }
}

.transition-ease {
  transition: all 0.2s ease-in-out;
}
</style>