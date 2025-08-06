<template>
  <span v-html="highlightedText"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  text: string | undefined;
  query: string | undefined;
}>();

const highlightedText = computed(() => {
  if (!props.query || !props.text) {
    return props.text || '';
  }
  // Escape special characters in the query to use it in a regex
  const escapedQuery = props.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return props.text.replace(regex, '<mark class="bg-warning p-0">$1</mark>');
});
</script>