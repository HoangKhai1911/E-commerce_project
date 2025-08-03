<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset';
  loading?: boolean;
  disabled?: boolean;
}>();

const buttonType = props.type || 'button';
</script>

<template>
  <button :type="buttonType" :disabled="loading || disabled" class="btn">
    <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
    <slot></slot>
  </button>
</template>