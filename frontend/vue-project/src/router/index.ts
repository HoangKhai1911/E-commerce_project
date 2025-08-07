import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/views/HomePage.vue'
import { useAuthStore } from '@/store/auth' // Import auth store
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
  
      children: [
        { path: '', name: 'Home', component: HomePage },
        { path: 'posts', name: 'PostList', component: () => import('@/views/posts/PostListPage.vue') },
        { path: 'posts/:slug', name: 'PostDetail', component: () => import('@/views/posts/PostDetailPage.vue') },
        { path: 'categories', name: 'CategoriesList', component: () => import('@/views/categories/CategoriesListPage.vue') },
        { path: 'categories/:slug', name: 'CategoryDetail', component: () => import('@/views/categories/CategoryDetailPage.vue') },
      ]
    },

    {
      path: '/auth/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginPage.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/auth/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterPage.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/auth/forgot-password',
      name: 'ForgotPassword',
      component: () => import('@/views/auth/ForgotPasswordPage.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/auth/verify-email',
      name: 'VerifyEmail',
      component: () => import('@/views/auth/VerifyEmailPage.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/search',
      name: 'Search',
      component: () => import('@/views/SearchPage.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('@/views/Profile.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    {
      path: '/preferences',
      name: 'Preferences',
      component: () => import('@/views/user/PreferencesPage.vue'),
      meta: { layout: 'DefaultLayout' }
    },
    // Admin Routes
    {
      path: '/admin/posts',
      name: 'PostManagement',
      component: () => import('@/views/admin/PostManagement.vue'),
      meta: { layout: 'AdminLayout', requiresAuth: true, requiresAdmin: true }
    },
    {
      // Thay đổi: Chuyển sang quy ước phổ biến hơn là /:id(\\d+)/edit
      path: '/admin/posts/:id/edit',
      name: 'AdminPostEdit',
      // Thêm props: true để tự động truyền `id` từ URL vào làm prop cho component
      props: true,
      component: () => import('@/views/admin/AdminPostEdit.vue'), // Sửa lỗi đường dẫn và dùng alias @
      meta: { layout: 'AdminLayout', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/sources',
      name: 'SourceManagement',
      component: () => import('@/views/admin/SourceManagement.vue'),
      meta: { layout: 'AdminLayout', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin/categories',
      name: 'CategoryManagement',
      component: () => import('@/views/admin/CategoryManagement.vue'),
      meta: { layout: 'AdminLayout', requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/admin',
      name: 'AdminDashboard',
      component: () => import('@/views/admin/AdminDashboard.vue'),
      meta: { layout: 'AdminLayout', requiresAuth: true, requiresAdmin: true }
    }
  ]
})

// Navigation Guard - Bộ bảo vệ định tuyến
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Nếu route yêu cầu quyền admin và người dùng không phải admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'Home' }); // Chuyển hướng về trang chủ
  } else {
    next(); // Cho phép truy cập
  }
});

export default router