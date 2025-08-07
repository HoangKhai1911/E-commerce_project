<template>
  <div class="container py-5">
    <h1>Bài viết trong danh mục: {{ slug }}</h1>
    <!-- Logic hiển thị bài viết theo danh mục sẽ ở đây -->
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();
const slug = computed(() => route.params.slug as string);
</script>