import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomePage
    },
    {
      // Route cho trang danh sách bài viết chung
      path: '/posts',
      name: 'PostList',
      component: () => import('@/views/posts/PostListPage.vue') // Bạn cần tạo component này
    },
    {
      path: '/posts/:slug',
      name: 'PostDetail',
      component: () => import('@/views/posts/PostDetailPage.vue')
    },
    {
      path: '/categories',
      name: 'CategoriesList',
      component: () => import('@/views/categories/CategoriesListPage.vue')
    },
    {
      path: '/categories/:slug',
      name: 'CategoryDetail',
      component: () => import('@/views/categories/CategoryDetailPage.vue')
    },
    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginPage.vue')
    },
    {
      path: '/auth/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterPage.vue')
    },
    {
      path: '/auth/verify-email',
      name: 'VerifyEmail',
      component: () => import('@/views/auth/VerifyEmailPage.vue')
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/SearchPage.vue') // Bạn cần tạo component này
    },
    /*
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/user/ProfilePage.vue') // Bạn cần tạo component này
    },
    {
      path: '/preferences',
      name: 'Preferences',
      component: () => import('@/views/user/PreferencesPage.vue') // Bạn cần tạo component này
    },
    */
    // Admin Routes
    {
      path: '/admin/posts',
      name: 'PostManagement',
      component: () => import('@/views/admin/PostManagement.vue')
    },
    {
      path: '/admin/sources',
      name: 'SourceManagement',
      component: () => import('@/views/admin/SourceManagement.vue')
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboard.vue') // Bạn cần tạo component này
    }
  ]
})

export default router