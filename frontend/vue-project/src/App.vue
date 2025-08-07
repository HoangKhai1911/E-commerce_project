<template>
  <component :is="layoutComponent">
    <RouterView />
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const layoutComponent = computed(() => {
  const layoutName = route.meta.layout || 'DefaultLayout';
  // Sử dụng defineAsyncComponent để lazy-load layout
  return defineAsyncComponent(() => import(`@/layouts/${layoutName}.vue`));
});
</script>