<template>
  <router-link
    :to="{ name: 'CategoryDetail', params: { slug: category.slug } }"
    class="card category-card text-center d-block text-decoration-none text-dark h-100 shadow-sm"
  >
    <div class="card-body d-flex flex-column justify-content-center align-items-center">
      <i class="bi bi-tag-fill display-5 mb-2 text-primary"></i>
      <h5 class="card-title fw-bold mb-0">{{ category.name }}</h5>
      <p v-if="category.point" class="card-text text-muted mt-1">
        <small>{{ category.point }} lượt xem</small>
      </p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Category {
  id: number;
  name: string;
  slug: string;
  point?: number; // Optional point for trending categories
}

const props = defineProps<{
  category: Category;
}>();
</script>

<style scoped>
.category-card {
  transition: all 0.2s ease-in-out;
  border-radius: var(--bs-border-radius-lg); /* Use larger border radius */
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
  border-color: var(--bs-primary) !important;
}

.category-card .card-body {
  padding: 1rem;
}

.category-card .card-title {
  font-size: 1rem;
}

.category-card .bi {
  font-size: 2.5rem; /* Adjust icon size */
}
</style>