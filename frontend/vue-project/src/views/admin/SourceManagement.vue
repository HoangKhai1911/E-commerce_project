<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Quản lý Nguồn tin</h1>
      <BaseButton @click="openModal()" class="btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Thêm Nguồn mới
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
              <th>Tên Nguồn</th>
              <th>URL</th>
              <th class="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="source in sources" :key="source.id">
              <td>{{ source.id }}</td>
              <td>{{ source.name }}</td>
              <td><a :href="source.url" target="_blank" rel="noopener noreferrer">{{ source.url }}</a></td>
              <td class="text-end">
                <BaseButton @click="openModal(source)" class="btn-sm btn-outline-secondary me-2">
                  <i class="bi bi-pencil"></i>
                </BaseButton>
                <BaseButton @click="handleDelete(source.id)" class="btn-sm btn-outline-danger">
                  <i class="bi bi-trash"></i>
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
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
              <BaseInput id="sourceUrl" label="URL" type="url" v-model="currentSource.url" required />
              <BaseInput id="sourceLogo" label="URL Logo (tùy chọn)" type="url" v-model="currentSource.logo_url" />
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
import { useUiStore } from '@/store/ui';
import type { Source } from '@/type';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import { Modal } from 'bootstrap';

const uiStore = useUiStore();
const sources = ref<Source[]>([]);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref<string | null>(null);

const sourceModalRef = ref<HTMLElement | null>(null);
let modalInstance: Modal | null = null;

const initialSourceState = { id: 0, name: '', url: '', logo_url: '' };
const currentSource = reactive<Source>({ ...initialSourceState });

const fetchSources = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    sources.value = await adminService.findSources();
  } catch (err) {
    error.value = 'Không thể tải danh sách nguồn.';
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
    Object.assign(currentSource, initialSourceState);
  }
  modalInstance?.show();
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    if (currentSource.id) {
      await adminService.updateSource(currentSource.id, { name: currentSource.name, url: currentSource.url, logo_url: currentSource.logo_url });
    } else {
      await adminService.createSource({ name: currentSource.name, url: currentSource.url, logo_url: currentSource.logo_url });
    }
    uiStore.addAlert('Lưu nguồn thành công!', 'success');
    modalInstance?.hide();
    await fetchSources();
  } catch (err) {
    uiStore.addAlert('Lưu nguồn thất bại.', 'danger');
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa nguồn này?')) {
    try {
      await adminService.deleteSource(id);
      uiStore.addAlert('Xóa nguồn thành công!', 'success');
      await fetchSources();
    } catch (err) {
      uiStore.addAlert('Xóa nguồn thất bại.', 'danger');
    }
  }
};
</script>
