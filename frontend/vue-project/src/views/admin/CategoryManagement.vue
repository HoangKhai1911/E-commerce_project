<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Quản lý Danh mục</h1>
      <BaseButton @click="openModal()" class="btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Thêm Danh mục
      </BaseButton>
    </div>

    <LoadingSpinner v-if="isLoading" />
    <BaseAlert v-if="error" :message="error" type="danger" />

    <div v-if="!isLoading" class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Danh mục</th>
              <th>Slug</th>
              <th class="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="category in categories" :key="category.id">
              <td>{{ category.id }}</td>
              <td>{{ category.name }}</td>
              <td>{{ category.slug }}</td>
              <td class="text-end">
                <BaseButton @click="openModal(category)" class="btn-sm btn-outline-secondary me-2">
                  <i class="bi bi-pencil"></i>
                </BaseButton>
                <BaseButton @click="handleDelete(category.id)" class="btn-sm btn-outline-danger">
                  <i class="bi bi-trash"></i>
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal for Create/Edit Category -->
    <div class="modal fade" id="categoryModal" tabindex="-1" ref="categoryModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ currentCategory.id ? 'Chỉnh sửa Danh mục' : 'Tạo Danh mục mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <BaseInput id="categoryName" label="Tên Danh mục" v-model="currentCategory.name" required />
            </form>
          </div>
          <div class="modal-footer">
            <BaseButton type="button" class="btn-secondary" data-bs-dismiss="modal">Hủy</BaseButton>
            <BaseButton @click="handleSave" :loading="isSaving" class="btn-primary">Lưu</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { adminService } from '@/services/adminService';
import { categoryService } from '@/services/categoryService';
import { useUiStore } from '@/store/ui';
import type { Category } from '@/type';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import { Modal } from 'bootstrap';

const uiStore = useUiStore();
const categories = ref<Category[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref<string | null>(null);

const categoryModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const initialCategoryState = { id: 0, name: '', slug: '' };
const currentCategory = reactive<Category>({ ...initialCategoryState });

const fetchCategories = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    categories.value = await categoryService.getAll();
  } catch (err) {
    error.value = 'Không thể tải danh sách danh mục.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  if (categoryModalRef.value) {
    modalInstance = new Modal(categoryModalRef.value);
  }
});

const openModal = (category: Category | null = null) => {
  if (category) {
    Object.assign(currentCategory, category);
  } else {
    Object.assign(currentCategory, initialCategoryState);
  }
  modalInstance?.show();
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    if (currentCategory.id) {
      await adminService.updateCategory(currentCategory.id, { name: currentCategory.name });
    } else {
      await adminService.createCategory({ name: currentCategory.name });
    }
    uiStore.addAlert('Lưu danh mục thành công!', 'success');
    modalInstance?.hide();
    await fetchCategories();
  } catch (err) {
    uiStore.addAlert('Lưu danh mục thất bại.', 'danger');
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
    try {
      await adminService.deleteCategory(id);
      uiStore.addAlert('Xóa danh mục thành công!', 'success');
      await fetchCategories();
    } catch (err) {
      uiStore.addAlert('Xóa danh mục thất bại.', 'danger');
    }
  }
};
</script>
