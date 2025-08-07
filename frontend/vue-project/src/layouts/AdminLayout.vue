<template>
  <div class="admin-layout d-flex">
    <AdminSidebar />
    <div class="admin-content flex-grow-1 p-4">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import AdminSidebar from '@/components/admin/AdminSidebar.vue';
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  background-color: #f8f9fa; // A light grey background for the content area
}
.admin-content {
  overflow-y: auto;
}
</style>