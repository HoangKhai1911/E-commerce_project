export default {
  routes: [
    // Đề xuất công khai cho người dùng chưa đăng nhập
    {
      method: 'GET',
      path: '/recommendations/unauthenticated',
      handler: 'recommendation.getUnauthenticatedRecommendations',
      config: {
        auth: false, // auth: false là cách đơn giản để đánh dấu route là public
      },
    },
    // Đề xuất cá nhân hóa cho người dùng đã đăng nhập
    {
      method: 'GET',
      path: '/recommendations/authenticated',
      handler: 'recommendation.getAuthenticatedRecommendations',
      // Không cần config, Strapi sẽ mặc định yêu cầu xác thực (jwt)
    },
    // Các bài viết liên quan (thường là public)
    {
      method: 'GET',
      path: '/recommendations/related/:id',
      handler: 'recommendation.getRelatedPosts',
      config: {
        auth: false, // Các bài viết liên quan nên được công khai để mọi người đều xem được
      },
    },
    // Tìm kiếm bài viết (public)
    {
      method: 'GET',
      path: '/recommendations/search',
      handler: 'recommendation.searchPosts',
      config: {
        auth: false,
      },
    },
    // Các danh mục nổi bật (public)
    {
      method: 'GET',
      path: '/recommendations/trending-categories',
      handler: 'recommendation.getTrendingCategories',
      config: {
        auth: false,
      },
    },
    // Gợi ý tìm kiếm (public)
    {
      method: 'GET',
      path: '/recommendations/suggestions',
      handler: 'recommendation.suggestPosts',
      config: {
        auth: false,
      },
    },
    // Lấy thông tin một danh mục (public)
    {
      method: 'GET',
      path: '/recommendations/category-info/:slug',
      handler: 'recommendation.getCategoryInfo',
      config: {
        auth: false,
      },
    },
  ],
};
