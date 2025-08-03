<template>
  <div v-if="posts && posts.length > 0" class="related-posts-section mt-5">
    <div class="container">
      <h3 class="mb-4 text-center text-primary fw-bold">Bài viết liên quan</h3>
      <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
        <div class="col" v-for="post in posts" :key="post.id">
          <PostCard :post="post" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Post } from '@/type';
import PostCard from './PostCard.vue';

defineProps<{
  posts: Post[];
}>();
</script>

<style lang="scss" scoped>
.related-posts-section {
  padding-top: 3rem;
  padding-bottom: 3rem;
  background-color: var(--bs-light);
}
</style>