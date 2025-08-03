<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  message: string;
  type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
}>();

const alertClass = computed(() => `alert alert-${props.type}`);
</script>

<template>
  <div :class="alertClass" role="alert">
    {{ message }}
  </div>
</template>