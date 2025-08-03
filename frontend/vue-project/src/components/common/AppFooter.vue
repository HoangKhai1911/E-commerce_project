<template>
  <footer class="bg-dark text-white py-4 mt-auto">
    <div class="container text-center">
      <p>&copy; {{ currentYear }} MyBlog. All rights reserved.</p>
      <nav class="nav justify-content-center">
        <a href="#" class="nav-link text-white-50">Privacy Policy</a>
        <a href="#" class="nav-link text-white-50">Terms of Service</a>
        <a href="#" class="nav-link text-white-50">Contact Us</a>
      </nav>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
/* Optional: Footer specific styles */
footer {
  /* This height variable is defined in _variables.scss if you want to use it */
  /* height: $footer-height; */
}
</style>