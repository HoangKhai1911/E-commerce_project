<template>
  <header class="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top py-3">
    <div class="container">
      <router-link :to="{ name: 'Home' }" class="navbar-brand fw-bolder">
        <span class="text-gradient">MyBlog</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Navigation links -->
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link :to="{ name: 'Home' }" class="nav-link" active-class="active">
              Trang chủ
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'CategoriesList' }" class="nav-link" active-class="active">
              Danh mục
            </router-link>
          </li>
          <li class="nav-item">
            <router-link :to="{ name: 'PostList' }" class="nav-link" active-class="active">
              Bài viết
            </router-link>
          </li>
        </ul>

        <!-- Search Form & Suggestions -->
        <div class="d-flex align-items-center me-3 position-relative">
          <form class="d-flex" @submit.prevent="handleSearchSubmit">
            <input
              class="form-control me-2"
              type="search"
              placeholder="Tìm kiếm..."
              aria-label="Search"
              v-model="searchQuery"
              @input="debouncedFetchSuggestions"
              @blur="hideSuggestions"
            />
            <button class="btn btn-outline-primary d-none d-md-block" type="submit">Tìm</button>
          </form>
          <ul v-if="showSuggestions && suggestions.length > 0" class="search-dropdown dropdown-menu show">
            <li v-for="suggestion in suggestions" :key="suggestion.id">
              <router-link :to="{ name: 'PostDetail', params: { slug: suggestion.slug } }" class="dropdown-item" @mousedown.prevent="goToSuggestion(suggestion)">
                {{ suggestion.title }}
              </router-link>
            </li>
          </ul>
        </div>

        <!-- User/Auth actions -->
        <ul class="navbar-nav">
          <li v-if="isAuthenticated" class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle d-flex align-items-center"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <img :src="authStore.user?.avatar?.url || 'https://placehold.co/40x40/E8E8E8/444444?text=AV'" alt="Avatar" class="user-avatar rounded-circle me-2">
              <span class="d-none d-lg-block">Chào, {{ authStore.user?.username || 'Bạn' }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="navbarDropdown">
              <li>
                <router-link :to="{ name: 'Profile' }" class="dropdown-item">
                  <i class="bi bi-person-circle me-2"></i>Hồ sơ của tôi
                </router-link>
              </li>
              <li>
                <router-link :to="{ name: 'Preferences' }" class="dropdown-item">
                  <i class="bi bi-gear-wide-connected me-2"></i>Sở thích
                </router-link>
              </li>
              <li v-if="isAdmin">
                <router-link :to="{ name: 'AdminDashboard' }" class="dropdown-item">
                  <i class="bi bi-speedometer me-2"></i>Trang Admin
                </router-link>
              </li>
              <li><hr class="dropdown-divider" /></li>
              <li>
                <button @click="handleLogout" class="dropdown-item">
                  <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                </button>
              </li>
            </ul>
          </li>
          <li v-else class="nav-item d-flex align-items-center">
            <router-link :to="{ name: 'Login' }" class="btn btn-primary me-2">
              Đăng nhập
            </router-link>
            <router-link :to="{ name: 'Register' }" class="btn btn-outline-primary">
              Đăng ký
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { storeToRefs } from 'pinia';
import { suggestPosts } from '@/services/searchService';
import type { PostSuggestion } from '@/services/searchService';
import { debounce } from 'lodash-es';

// Bổ sung Bootstrap Icons CSS vào file index.html hoặc main.js
// <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

const authStore = useAuthStore();
const router = useRouter();
const { isAuthenticated, isAdmin } = storeToRefs(authStore);

const searchQuery = ref('');
const suggestions = ref<PostSuggestion[]>([]);
const showSuggestions = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push({ name: 'Home' });
};

const handleSearchSubmit = () => {
  if (searchQuery.value.trim()) {
    router.push({ name: 'Search', query: { q: searchQuery.value.trim() } });
    searchQuery.value = '';
    showSuggestions.value = false;
  }
};

const fetchSuggestions = async () => {
  if (searchQuery.value.trim().length > 2) {
    suggestions.value = await suggestPosts(searchQuery.value.trim());
    showSuggestions.value = suggestions.value.length > 0;
  } else {
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

const hideSuggestions = () => {
  setTimeout(() => { showSuggestions.value = false; }, 200);
};

const goToSuggestion = (suggestion: PostSuggestion) => {
  router.push({ name: 'PostDetail', params: { slug: suggestion.slug } });
  searchQuery.value = '';
  suggestions.value = [];
  showSuggestions.value = false;
};
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

// Variables and mixins for colors and gradients
$primary-color: #007bff;
$secondary-color: #6c757d;
$accent-color-1: #00c6ff;
$accent-color-2: #0072ff;

@mixin gradient-text($from-color, $to-color) {
  background: linear-gradient(90deg, $from-color 0%, $to-color 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

header {
  font-family: 'Inter', sans-serif;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .navbar-brand {
    font-size: 1.75rem;
    .text-gradient {
      @include gradient-text($accent-color-1, $accent-color-2);
    }
  }

  .nav-link {
    font-weight: 500;
    margin: 0 0.5rem;
    transition: color 0.3s ease, border-bottom 0.3s ease;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid transparent;

    &:hover {
      color: $primary-color !important;
      border-bottom: 2px solid $primary-color;
    }

    &.active {
      font-weight: bold;
      color: $primary-color !important;
      border-bottom: 2px solid $primary-color;
    }
  }

  .form-control {
    border-radius: 0.5rem;
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.25);
      border-color: $primary-color;
    }
  }

  .btn {
    border-radius: 0.5rem;
    font-weight: 600;
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border: 2px solid rgba($primary-color, 0.5);
  }

  .search-dropdown {
    position: absolute;
    width: 100%;
    top: 100%;
    margin-top: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}
</style>
