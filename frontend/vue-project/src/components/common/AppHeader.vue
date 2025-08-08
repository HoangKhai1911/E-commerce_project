<template>
  <header class="navbar navbar-expand-lg py-3 sticky-top">
    <div class="container d-flex justify-content-between align-items-center position-relative">

      <!-- Logo -->
      <router-link
        v-if="showSearchBar"
        :to="{ name: 'Home' }"
        class="navbar-brand fw-bolder"
      >
        <span class="text-gradient">MyBlog</span>
      </router-link>

      <!-- Nút toggle cho mobile -->
      <button
        class="navbar-toggler ms-auto"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse justify-content-between" id="navbarNav">
        <!-- Vị trí mới cho thanh tìm kiếm và menu -->
        <ul v-if="showSearchBar" class="navbar-nav d-lg-flex d-none me-auto mb-2 mb-lg-0">
           <li class="nav-item">
            <router-link :to="{ name: 'PostList' }" class="nav-link" active-class="active">
              Bài viết
            </router-link>
          </li>
        </ul>

        <!-- Thanh tìm kiếm ở giữa trên desktop -->
        <div v-if="showSearchBar" class="d-lg-flex d-none flex-grow-1 justify-content-center px-5 mx-5">
            <form class="d-flex position-relative w-100" @submit.prevent="handleSearchSubmit" style="max-width: 500px;">
              <input
                class="form-control"
                type="search"
                placeholder="Tìm kiếm bài viết..."
                aria-label="Search"
                v-model="searchQuery"
                @input="debouncedFetchSuggestions"
                @blur="hideSuggestions"
              />
              <!-- Gợi ý -->
              <ul
                v-if="showSuggestions && suggestions.length > 0"
                class="search-dropdown dropdown-menu show"
              >
                <li
                  v-for="suggestion in suggestions"
                  :key="suggestion.id"
                >
                  <router-link
                    :to="{ name: 'PostDetail', params: { slug: suggestion.slug } }"
                    class="dropdown-item"
                    @mousedown.prevent="goToSuggestion(suggestion)"
                  >
                    {{ suggestion.title }}
                  </router-link>
                </li>
              </ul>
            </form>
        </div>
        
        <!-- Menu mobile và tài khoản -->
        <ul class="navbar-nav d-lg-flex align-items-center ms-auto">
          <!-- Thanh tìm kiếm cho mobile -->
          <li v-if="showSearchBar" class="nav-item d-lg-none w-100 mb-2">
            <form class="d-flex position-relative w-100" @submit.prevent="handleSearchSubmit">
                <input
                class="form-control"
                type="search"
                placeholder="Tìm kiếm..."
                aria-label="Search"
                v-model="searchQuery"
                @input="debouncedFetchSuggestions"
                @blur="hideSuggestions"
                />
            </form>
          </li>
          
          <!-- Bài viết cho mobile -->
          <li v-if="showSearchBar" class="nav-item d-lg-none">
            <router-link :to="{ name: 'PostList' }" class="nav-link" active-class="active">
              Bài viết
            </router-link>
          </li>

          <!-- Tài khoản -->
          <li v-if="showSearchBar" class="nav-item dropdown">
            <template v-if="isAuthenticated">
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
            </template>
            <template v-else>
              <a
                class="nav-link dropdown-toggle d-flex align-items-center"
                href="#"
                id="guestDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-person-circle fs-5 me-2"></i>
                <span>Tài khoản</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end shadow" aria-labelledby="guestDropdown">
                <li>
                  <router-link :to="{ name: 'Login' }" class="dropdown-item">
                    <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ name: 'Register' }" class="dropdown-item">
                    <i class="bi bi-person-plus me-2"></i>Đăng ký
                  </router-link>
                </li>
              </ul>
            </template>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { storeToRefs } from 'pinia';
import { suggestPosts } from '@/services/searchService';
import type { PostSuggestion } from '@/services/searchService';
import { debounce } from 'lodash-es';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();
const { isAuthenticated, isAdmin } = storeToRefs(authStore);

const searchQuery = ref('');
const suggestions = ref<PostSuggestion[]>([]);
const showSuggestions = ref(false);

// Ẩn thanh tìm kiếm nếu ở Login hoặc Register
const showSearchBar = computed(() => {
  const hiddenRoutes = ['Login', 'Register'];
  return !hiddenRoutes.includes(route.name as string);
});

const handleLogout = () => {
  // Xóa thông tin xác thực khỏi store và localStorage.
  authStore.logout();
  // Thay vì dùng router.push, ta dùng window.location.href để thực hiện
  // một lần tải lại trang hoàn chỉnh. Điều này đảm bảo mọi trạng thái cũ
  // (bao gồm cả token trong header của API client) được xóa sạch.
  window.location.href = '/';
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');

// Variables and mixins for colors and gradients
$primary-color: #007bff;
$secondary-color: #6c757d;
$accent-color-1: #00c6ff;
$accent-color-2: #0072ff;
$light-blue-bg: #E3F2FD; // Màu xanh biển nhạt
$navbar-bg-color: #ffffff; // Màu trắng cho navbar
$text-color: #495057;

@mixin gradient-text($from-color, $to-color) {
  background: linear-gradient(90deg, $from-color 0%, $to-color 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

// Áp dụng màu nền cho toàn bộ trang (sử dụng global style)
body {
  background-color: $light-blue-bg;
}

header {
  font-family: 'Inter', sans-serif;
  background-color: $light-blue-bg; // Màu nền xanh biển nhạt
  border-bottom: 1px solid #02111CFF;

  .navbar-brand {
    font-size: 1.75rem;
    .text-gradient {
      @include gradient-text($accent-color-1, $accent-color-2);
    }
  }

  .nav-link {
    font-weight: 500;
    color: $text-color;
    margin: 0 0.75rem;
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

  .dropdown-menu {
    min-width: 100px;
    border-radius: 0.5rem;
    border: none;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  .form-control {
    border-radius: 0.5rem;
    border: 1px solid #ced4da;
    &:focus {
      box-shadow: 0 0 0 0.2rem rgba($primary-color, 0.25);
      border-color: $primary-color;
    }
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border: 2px solid $primary-color;
  }

  .search-dropdown {
    position: absolute;
    width: 100%;
    top: 100%;
    margin-top: 0.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  @media (max-width: 991.98px) {
    .navbar-collapse {
      text-align: center;
      padding-top: 1rem;
      .navbar-nav {
        flex-direction: column;
        align-items: center !important;
      }
    }
    .nav-item {
        margin-bottom: 0.5rem;
    }
    .user-avatar {
        margin-bottom: 0.5rem;
    }
    .form-control {
        width: 100%;
    }
  }
}

</style>
