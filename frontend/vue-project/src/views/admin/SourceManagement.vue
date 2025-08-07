<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Quản lý Nguồn (Sources)</h1>
      <BaseButton @click="openModal()" class="btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Thêm Nguồn
      </BaseButton>
    </div>

    <LoadingSpinner v-if="isLoading" />
    <BaseAlert v-if="error" :message="error" type="danger" />

    <div v-if="!isLoading && sources.length > 0" class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-striped table-hover mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th style="width: 80px;">Logo</th>
              <th>Tên Nguồn</th>
              <th>URL</th>
              <th class="text-end">Hành động</th>
            </tr> 
          </thead>
          <tbody>
            <tr v-for="source in sources" :key="source.id">
              <td>{{ source.id }}</td>
              <td>
                <img 
                  v-if="source.logo" 
                  :src="source.logo.url" 
                  :alt="source.name" 
                  class="source-logo"
                />
                <span v-else class="text-muted text-center d-block">-</span>
              </td>
              <td>{{ source.name }}</td>
              <td><a :href="source.URL" target="_blank" rel="noopener noreferrer">{{ source.URL }}</a></td>
              <td class="text-end">
                <BaseButton @click="openModal(source)" class="btn-sm btn-outline-secondary me-2" title="Chỉnh sửa">
                  <i class="bi bi-pencil"></i>
                </BaseButton>
                <BaseButton @click="handleDelete(source.id)" class="btn-sm btn-outline-danger" title="Xóa">
                  <i class="bi bi-trash"></i>
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else-if="!isLoading && sources.length === 0" class="card shadow-sm">
      <div class="card-body">
        <p class="text-muted text-center">
          Chưa có nguồn nào được thêm. Hãy thêm nguồn mới để bắt đầu!
        </p>
      </div>
    </div>

    <!-- Modal for Create/Edit Source -->
    <div class="modal fade" id="sourceModal" tabindex="-1" ref="sourceModalRef">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ currentSource.id ? 'Chỉnh sửa Nguồn' : 'Tạo Nguồn mới' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSave">
              <BaseInput id="sourceName" label="Tên Nguồn" v-model="currentSource.name" required />
              <BaseInput id="sourceUrl" label="URL" type="url" v-model="currentSource.URL" required />
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
import { sourceService } from '@/services/sourceService'; // Dịch vụ API cho nguồn
import { useUiStore } from '@/store/ui';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import { Modal } from 'bootstrap'; // Đảm bảo bạn đã cài đặt bootstrap và import Modal

// Interface cho dữ liệu logo
interface Logo {
  id: number;
  url: string;
}

// Định nghĩa kiểu dữ liệu cho Source
interface Source {
  id: number;
  name: string;
  URL: string;
  logo?: Logo;
}

const uiStore = useUiStore();
const sources = ref<Source[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref<string | null>(null);

const sourceModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const initialSourceState = { id: 0, name: '', URL: '' };
const currentSource = reactive<Source>({ ...initialSourceState });

const fetchSources = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // 🔴 THAY ĐỔI Ở ĐÂY: Thêm tham số sort để sắp xếp theo ID tăng dần
    sources.value = await sourceService.getAll({ sort: 'id:asc' });
  } catch (err: any) {
    error.value = 'Không thể tải danh sách nguồn. ' + (err.message || 'Vui lòng kiểm tra console để biết thêm chi tiết.');
    console.error('Error fetching sources:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchSources();
  if (sourceModalRef.value) {
    modalInstance = new Modal(sourceModalRef.value);
  }
});

const openModal = (source: Source | null = null) => {
  if (source) {
    Object.assign(currentSource, source);
  } else {
    // Đặt lại các thuộc tính một cách rõ ràng để đảm bảo tính phản ứng (reactivity)
    currentSource.id = 0;
    currentSource.name = '';
    currentSource.URL = '';
  }
  modalInstance?.show();
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    if (currentSource.id) {
      const updateData = { name: currentSource.name, URL: currentSource.URL };
      await sourceService.update(currentSource.id, updateData);
    } else {
      const createData = { name: currentSource.name, URL: currentSource.URL };
      await sourceService.create(createData);
    }
    uiStore.addAlert('Lưu nguồn thành công!', 'success');
    modalInstance?.hide();
    await fetchSources(); // Tải lại danh sách sau khi lưu
  } catch (err: any) {
    let errorMessage = 'Lưu nguồn thất bại.';
    // Strapi validation errors have a specific, detailed structure
    if (err.response?.data?.error?.name === 'ValidationError') {
      // Join messages from all validation errors for a comprehensive message
      const details = err.response.data.error.details?.errors
        ?.map((e: any) => e.message)
        .join(', ') 
        || err.response.data.error.message;
      errorMessage += ` Lý do: ${details}`;
    } else if (err.response?.data?.error?.message) {
      // Handle other types of Strapi errors
      errorMessage += ` Lý do: ${err.response.data.error.message}`;
    } else if (err.message) {
      // Handle generic network or other client-side errors
      errorMessage += ` Chi tiết: ${err.message}`;
    }
    uiStore.addAlert(errorMessage, 'danger');
    console.error('Error saving source:', err.response?.data || err);
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  const confirmed = await uiStore.showConfirm('Bạn có chắc chắn muốn xóa nguồn này?', 'Xác nhận xóa');
  if (confirmed) {
    try {
      await sourceService.delete(id);
      uiStore.addAlert('Xóa nguồn thành công!', 'success');
      await fetchSources(); // Tải lại danh sách sau khi xóa
    } catch (err: any) {
      uiStore.addAlert('Xóa nguồn thất bại. ' + (err.message || ''), 'danger');
      console.error('Error deleting source:', err);
    }
  }
};
</script>

<style scoped>
.source-logo {
  max-width: 60px;
  max-height: 40px;
  object-fit: contain;
  display: block;
  margin: auto;
}
</style>
