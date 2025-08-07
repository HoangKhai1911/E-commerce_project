<template>
  <div class="image-uploader">
    <div class="current-image-wrapper mb-3" v-if="displayUrl">
      <label class="form-label">Ảnh hiện tại:</label>
      <img :src="displayUrl" alt="Preview" class="img-thumbnail d-block" />
    </div>
    <div class="mb-3">
      <label for="imageUpload" class="form-label">{{ displayUrl ? 'Thay đổi ảnh' : 'Tải lên ảnh mới' }}</label>
      <input class="form-control" type="file" id="imageUpload" @change="handleFileChange" accept="image/*">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  currentImageUrl?: string | null;
}>();

const emit = defineEmits<{
  (e: 'file-selected', file: File | null): void;
}>();

const selectedFile = ref<File | null>(null);

const displayUrl = computed(() => {
  if (selectedFile.value) {
    return URL.createObjectURL(selectedFile.value);
  }
  return props.currentImageUrl;
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    emit('file-selected', selectedFile.value);
  } else {
    selectedFile.value = null;
    emit('file-selected', null);
  }
};
</script>

<style scoped>
.img-thumbnail {
  max-width: 250px;
  max-height: 250px;
  object-fit: cover;
}
</style>