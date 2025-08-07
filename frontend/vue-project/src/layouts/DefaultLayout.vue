<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />
    <main class="flex-shrink-0">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
</script>