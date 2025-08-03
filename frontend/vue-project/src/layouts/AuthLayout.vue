<template>
  <div class="auth-layout d-flex align-items-center justify-content-center min-vh-100">
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<style lang="scss" scoped>
.auth-layout {
  background-color: var(--bs-light);
  // Thêm một background pattern nhẹ nhàng để trang không bị đơn điệu
  background-image: linear-gradient(45deg, #f1f2f6 25%, transparent 25%), linear-gradient(-45deg, #f1f2f6 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f1f2f6 75%), linear-gradient(-45deg, transparent 75%, #f1f2f6 75%);
  background-size: 20px 20px;
}
</style>