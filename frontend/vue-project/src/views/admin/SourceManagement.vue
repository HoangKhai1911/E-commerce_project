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
    const result = await adminService.findSources();
    sources.value = result;
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    error.value = 'Không thể tải danh sách nguồn: ' + message;
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
    currentSource.id = source.id;
    currentSource.name = source.name;
    currentSource.url = source.url;
    currentSource.logo_url = source.logo_url || '';
  } else {
    Object.assign(currentSource, initialSourceState);
  }
  modalInstance?.show();
};

const handleSave = async () => {
  isSaving.value = true;
  try {
    // Sửa lỗi: Tạo một đối tượng data mới và xử lý logo_url
    // Nếu logo_url là chuỗi rỗng ('') thì gán giá trị undefined
    const dataToSave = {
      name: currentSource.name,
      url: currentSource.url,
      logo_url: currentSource.logo_url === '' ? undefined : currentSource.logo_url,
    };

    if (currentSource.id) {
      await adminService.updateSource(currentSource.id, dataToSave);
    } else {
      await adminService.createSource(dataToSave);
    }
    uiStore.addAlert('Lưu nguồn thành công!', 'success');
    modalInstance?.hide();
    await fetchSources();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Lỗi không xác định';
    uiStore.addAlert('Lưu nguồn thất bại: ' + message, 'danger');
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
      const message = err instanceof Error ? err.message : 'Lỗi không xác định';
      uiStore.addAlert('Xóa nguồn thất bại: ' + message, 'danger');
    }
  }
};
</script>
