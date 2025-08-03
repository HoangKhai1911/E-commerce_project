import { createRouter, createWebHistory } from 'vue-router';
import HomePage from '../views/HomePage.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import AdminLayout from '@/layouts/AdminLayout.vue';
import { useAuthStore } from '@/store/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        { path: '', name: 'Home', component: HomePage },
        { path: 'posts', name: 'PostList', component: () => import('@/views/posts/PostListPage.vue') },
        { path: 'posts/:slug', name: 'PostDetail', component: () => import('@/views/posts/PostDetailPage.vue') },
        { path: 'categories', name: 'CategoriesList', component: () => import('@/views/categories/CategoriesListPage.vue') },
        { path: 'categories/:slug', name: 'CategoryDetail', component: () => import('@/views/categories/CategoryDetailPage.vue') },
        { path: 'search', name: 'Search', component: () => import('@/views/SearchPage.vue') },
        { path: 'profile', name: 'Profile', component: () => import('@/views/profile/ProfilePage.vue'), meta: { requiresAuth: true } },
        { path: 'profile/preferences', name: 'Preferences', component: () => import('@/views/profile/PreferencesPage.vue'), meta: { requiresAuth: true } },
      ]
    },
    {
      path: '/auth',
      component: AuthLayout,
      children: [
        { path: 'login', name: 'Login', component: () => import('@/views/auth/LoginPage.vue') },
        { path: 'register', name: 'Register', component: () => import('@/views/auth/RegisterPage.vue') },
        { path: 'verify-email', name: 'VerifyEmail', component: () => import('@/views/auth/VerifyEmailPage.vue') },
        // Thêm các trang auth khác như forgot-password ở đây
      ]
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/AdminDashboard.vue') },
        { path: 'sources', name: 'AdminSources', component: () => import('@/views/admin/SourceManagement.vue') },
        { path: 'categories', name: 'AdminCategories', component: () => import('@/views/admin/CategoryManagement.vue') },
        { path: 'posts', name: 'AdminPosts', component: () => import('@/views/admin/PostManagement.vue') },
        { path: 'users', name: 'AdminUsers', component: () => import('@/views/admin/UserManagement.vue') },
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundPage.vue')
    }
  ],
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Đảm bảo Pinia đã được khởi tạo trước khi sử dụng store
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;
  // Lấy tên vai trò của người dùng, mặc định là chuỗi rỗng nếu không có
  const userRole = authStore.user?.role?.name || '';

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  // 1. Xử lý các trang không yêu cầu đăng nhập (Login, Register)
  // Nếu người dùng đã đăng nhập, chuyển hướng họ khỏi trang Login/Register
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    return next({ name: 'Home' });
  }

  // 2. Xử lý các trang yêu cầu đăng nhập (requiresAuth)
  if (requiresAuth && !isAuthenticated) {
    // Nếu trang yêu cầu đăng nhập mà người dùng chưa đăng nhập,
    // chuyển hướng đến trang Login và lưu lại trang họ định đến.
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 3. Xử lý các trang yêu cầu quyền Admin (requiresAdmin)
  if (requiresAdmin) {
    // Nếu người dùng đã đăng nhập nhưng không phải là 'Administrator',
    // chuyển hướng họ về trang chủ.
    // 'Administrator' là tên vai trò mặc định của admin trong Strapi.
    if (isAuthenticated && userRole !== 'Administrator') {
      // Bạn có thể hiển thị thông báo "Không có quyền truy cập" ở đây
      return next({ name: 'Home' });
    }
  }

  // 4. Nếu tất cả các điều kiện đều thỏa mãn, cho phép truy cập
  return next();
});

export default router;