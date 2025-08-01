'use strict';

/**
 * A set of functions called "actions" for `recommendation`
 */
module.exports = {
  /**
   * GET /api/recommendations/unauthenticated
   * Đề xuất công khai cho người dùng chưa đăng nhập.
   * Logic: các bài viết trong ngày, sắp xếp theo clickCount, cộng thêm các bài viết có nhiều lượt xem nhất nếu số lượng chưa đủ.
   */
  async getUnauthenticatedRecommendations(ctx) {
    try {
      // Xây dựng chuỗi ngày YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // 1) Lấy các bài viết được xuất bản từ nửa đêm hôm nay, sắp xếp theo clickCount
      let posts = await strapi.entityService.findMany('api::post.post', {
        filters: { publishedAt: { $gte: `${today}T00:00:00.000Z` } },
        sort: { clickCount: 'desc' },
        populate: ['categories', 'source'],
      });

      // 2) Nếu số lượng bài viết < 10, lấy thêm các bài viết có clickCount cao nhất
      if (posts.length < 10) {
        const extra = await strapi.entityService.findMany('api::post.post', {
          sort: { clickCount: 'desc' },
          populate: ['categories', 'source'],
        });
        posts = posts.concat(extra);
      }

      // 3) Trả về một mảng các đối tượng bài viết đã được chọn lọc
      ctx.body = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        clickCount: post.clickCount,
        // Có thể thêm các trường khác nếu cần
      }));
    } catch (error) {
      console.error('Lỗi khi lấy bài viết đề xuất cho người dùng chưa đăng nhập:', error);
      ctx.body = { error: 'Failed to fetch recommendations', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * GET /api/recommendations/authenticated
   * Đề xuất cá nhân hóa cho người dùng đã đăng nhập dựa trên sở thích (danh mục yêu thích).
   */
  async getAuthenticatedRecommendations(ctx) {
    try {
      // Lấy ID của người dùng đã đăng nhập từ context
      const userId = ctx.state.user.id;
      if (!userId) {
        return ctx.unauthorized('Bạn cần đăng nhập để xem đề xuất này.');
      }

      // 1) Lấy thông tin người dùng, bao gồm các danh mục yêu thích của họ
      const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        populate: ['categories'],
      });

      if (!user || !user.categories || user.categories.length === 0) {
        // Nếu người dùng chưa có sở thích, sẽ trả về đề xuất công khai
        console.log(`Người dùng ${userId} chưa có sở thích. Trả về đề xuất công khai.`);
        // Gọi lại hàm đề xuất cho người dùng chưa đăng nhập
        return this.getUnauthenticatedRecommendations(ctx);
      }

      // 2) Lấy danh sách ID của các danh mục yêu thích
      const preferredCategoryIds = user.categories.map(category => category.id);

      // 3) Lấy toàn bộ các bài viết thuộc các danh mục yêu thích, sắp xếp theo ngày xuất bản mới nhất
      const posts = await strapi.entityService.findMany('api::post.post', {
        filters: {
          categories: {
            id: { $in: preferredCategoryIds },
          },
        },
        sort: { publishedAt: 'desc' },
        populate: ['categories', 'source'],
      });

      // 4) Trả về một mảng các đối tượng bài viết đã được chọn lọc
      ctx.body = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        clickCount: post.clickCount,
      }));

    } catch (error) {
      console.error('Lỗi khi lấy bài viết đề xuất cho người dùng đã đăng nhập:', error);
      ctx.body = { error: 'Failed to fetch recommendations', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * GET /api/recommendations/related/:id
   * Đề xuất các bài viết liên quan dựa trên các danh mục của bài viết hiện tại.
   */
  async getRelatedPosts(ctx) {
    try {
      // Lấy ID của bài viết hiện tại từ params
      const postId = ctx.params.id;

      // 1) Lấy bài viết hiện tại cùng với các danh mục của nó
      const currentPost = await strapi.entityService.findOne('api::post.post', postId, {
        populate: ['categories'],
      });

      if (!currentPost) {
        return ctx.notFound('Bài viết không tồn tại.');
      }

      // 2) Lấy danh sách ID của các danh mục của bài viết hiện tại
      const categoryIds = currentPost.categories.map(category => category.id);

      // 3) Lấy các bài viết khác có cùng danh mục, sắp xếp theo ngày xuất bản
      const relatedPosts = await strapi.entityService.findMany('api::post.post', {
        filters: {
          id: { $ne: postId }, // Loại bỏ bài viết hiện tại
          categories: {
            id: { $in: categoryIds },
          },
        },
        sort: { publishedAt: 'desc' },
        limit: 3, // Giới hạn số lượng bài viết liên quan là 3
        populate: ['categories', 'source'],
      });

      // 4) Trả về một mảng các đối tượng bài viết đã được chọn lọc
      ctx.body = relatedPosts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        publishedAt: post.publishedAt,
        clickCount: post.clickCount,
      }));

    } catch (error) {
      console.error('Lỗi khi lấy bài viết liên quan:', error);
      ctx.body = []; // Trả về mảng rỗng khi có lỗi
    }
  },

  /**
   * GET /api/recommendations/search?q=<query>&page=<page>
   * Tìm kiếm bài viết. Nếu người dùng đã đăng nhập, ưu tiên tìm kiếm trong các danh mục yêu thích.
   * Nếu không có từ khóa tìm kiếm, sẽ trả về danh sách bài viết mới nhất (giống trang chủ).
   */
  async searchPosts(ctx) {
    try {
      const { q, page = 1, pageSize = 10 } = ctx.query;
      const start = (page - 1) * pageSize;

      const userId = ctx.state.user?.id;
      let filters = {};

      // Nếu có từ khóa tìm kiếm, áp dụng bộ lọc tìm kiếm
      if (q) {
        const baseFilters = {
          $or: [
            { title: { $containsi: q } },
            { content: { $containsi: q } },
          ],
        };

        if (userId) {
          const user = await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
            populate: ['categories'],
          });

          if (user?.categories?.length > 0) {
            const preferredCategoryIds = user.categories.map(cat => cat.id);
            filters = {
              $and: [
                baseFilters,
                {
                  categories: {
                    id: { $in: preferredCategoryIds },
                  },
                },
              ],
            };
          } else {
            filters = baseFilters;
          }
        } else {
          filters = baseFilters;
        }
      } else {
        // Nếu không có từ khóa, filters sẽ rỗng để lấy tất cả bài viết.
      }

      const posts = await strapi.entityService.findMany('api::post.post', {
        filters,
        sort: { publishedAt: 'desc' },
        start,
        limit: pageSize,
        populate: ['categories', 'source'],
      });

      const count = await strapi.entityService.count('api::post.post', { filters });
      
      const response = {
        data: posts.map(post => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          publishedAt: post.publishedAt,
          clickCount: post.clickCount,
        })),
        meta: {
          pagination: {
            page: parseInt(page, 10),
            pageSize: parseInt(pageSize, 10),
            pageCount: Math.ceil(count / pageSize),
            total: count,
          },
        },
      };

      ctx.body = response;
    } catch (error) {
      console.error('Lỗi khi tìm kiếm bài viết:', error);
      ctx.body = { error: 'Failed to search posts', details: error.message };
      ctx.response.status = 500;
    }
  },
  
  /**
   * GET /api/recommendations/suggestions?q=<query>
   * Đề xuất các bài viết dựa trên tiêu đề khớp một phần với từ khóa.
   */
  async suggestPosts(ctx) {
    try {
      const { q } = ctx.query;
      const limit = 7;

      if (!q || q.length < 2) {
        return ctx.body = [];
      }

      const posts = await strapi.entityService.findMany('api::post.post', {
        filters: {
          title: {
            $containsi: q,
          },
        },
        sort: { publishedAt: 'desc' },
        limit,
        fields: ['title', 'slug', 'id'], // Chỉ lấy các trường cần thiết để tăng tốc độ
      });

      ctx.body = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
      }));

    } catch (error) {
      console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
      ctx.body = []; // Trả về mảng rỗng khi có lỗi
    }
  },
};
