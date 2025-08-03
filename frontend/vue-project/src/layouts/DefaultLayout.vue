<template>
  <div class="d-flex flex-column min-vh-100">
    <AppHeader />

    <main class="flex-grow-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <AppFooter />

    <!-- Component thông báo toàn cục -->
    <TheNotification />
  </div>
</template>

<script setup lang="ts">
import AppHeader from '@/components/common/AppHeader.vue';
import AppFooter from '@/components/common/AppFooter.vue';
import TheNotification from '@/components/ui/TheNotification.vue';
import { RouterView } from 'vue-router';
</script>

<style scoped>
/* Các style dành riêng cho layout này có thể được thêm vào đây */
</style>