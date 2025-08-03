<template>
  <nav v-if="meta.pageCount > 1" aria-label="Page navigation">
    <ul class="pagination justify-content-center">
      <!-- Previous Page Link -->
      <li class="page-item" :class="{ disabled: modelValue === 1 }">
        <a class="page-link" href="#" @click.prevent="changePage(modelValue - 1)">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>

      <!-- Page Numbers -->
      <li
        v-for="page in pages"
        :key="page"
        class="page-item"
        :class="{ active: page === modelValue, disabled: page === '...' }"
      >
        <a v-if="page !== '...'" class="page-link" href="#" @click.prevent="changePage(page)">
          {{ page }}
        </a>
        <span v-else class="page-link">...</span>
      </li>

      <!-- Next Page Link -->
      <li class="page-item" :class="{ disabled: modelValue === meta.pageCount }">
        <a class="page-link" href="#" @click.prevent="changePage(modelValue + 1)">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface PaginationMeta {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

const props = defineProps<{
  meta: PaginationMeta;
  modelValue: number; // The current page, for v-model
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', page: number): void;
}>();

const changePage = (page: number | '...') => {
  // Thêm một type guard để đảm bảo chỉ xử lý khi page là một số.
  if (typeof page !== 'number') return;

  if (page > 0 && page <= props.meta.pageCount) {
    emit('update:modelValue', page);
  }
};

// Computed property to generate the list of pages to display
const pages = computed<(number | '...')[]>(() => {
  const { pageCount, page: currentPage } = props.meta;
  const range: (number | '...')[] = [];
  const delta = 2; // Number of pages to show around the current page

  // Logic to create a smart pagination (e.g., 1 ... 4 5 6 ... 10)
  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(pageCount - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    range.unshift('...');
  }
  if (currentPage + delta < pageCount - 1) {
    range.push('...');
  }

  range.unshift(1);
  if (pageCount > 1) {
    range.push(pageCount);
  }

  // Remove duplicates that might occur with small page counts
  return [...new Set(range)];
});
</script>

<style scoped>
.page-link {
  cursor: pointer;
}
.page-item.disabled .page-link {
  cursor: not-allowed;
}
.page-item.active .page-link {
  z-index: 1; /* Ensure active page is on top */
}
</style>