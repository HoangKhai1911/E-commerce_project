<script setup lang="ts">
import { computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { RouterLink } from 'vue-router';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import api from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  // stats?: { point: number }[]; // Nếu bạn muốn hiển thị điểm trending
}

// The API response for a collection has a specific structure
interface StrapiCategoryResponse {
  data: Category[];
  meta: any;
}

// useApi will automatically handle fetching, loading, and error states.
const { data, isLoading, error } = useApi<StrapiCategoryResponse>(() => api.get('/categories'));

// Use a computed property to safely access the nested category array from the response.
const categories = computed(() => data.value?.data || []);

</script>

<template>
  <div class="container py-5">
    <h2 class="mb-5 text-center text-primary fw-bold">Khám phá các Danh mục</h2>

    <LoadingSpinner v-if="isLoading" class="my-5" />
    <BaseAlert v-if="error" :message="error" type="danger" class="mb-4" />

    <div v-if="!isLoading && !error && categories.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div class="col" v-for="category in categories" :key="category.id">
        <RouterLink :to="`/categories/${category.slug}`" class="card category-card h-100 shadow-sm border-0 text-decoration-none d-block">
          <div class="card-body d-flex flex-column align-items-center justify-content-center">
            <h5 class="card-title fw-bold text-dark text-center mb-0">{{ category.name }}</h5>
            </div>
        </RouterLink>
      </div>
    </div>

    <div v-else-if="!isLoading && !error && categories.length === 0" class="alert alert-info text-center" role="alert">
      Không tìm thấy danh mục nào.
    </div>
  </div>
</template>

<style lang="scss" scoped>
.category-card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  min-height: 150px;
  background-color: var(--bs-white);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
    .card-title {
      color: var(--bs-primary) !important;
    }
  }
}

.card-title {
  font-size: 1.5rem;
  transition: color 0.2s ease;
}
</style>