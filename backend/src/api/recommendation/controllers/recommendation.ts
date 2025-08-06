'use strict';

import type { Context } from 'koa';

// Định nghĩa interface cho Category, bao gồm các trường mà bạn truy cập
interface Category {
  id: number;
  name: string; // Giả sử category có trường 'name'
  slug: string; // Giả sử category có trường 'slug'
  posts?: { id: number }[]; // Thêm posts để có thể truy cập .length, chỉ cần id là đủ
  // Thêm các trường khác của category nếu bạn truy cập chúng, ví dụ: createdAt, updatedAt
}

// Định nghĩa interface cho User khi đã populate categories
// Đảm bảo rằng 'categories' là một mảng các Category khi được populate
interface PopulatedUser {
  id: number;
  username: string; // Giả sử user có trường 'username'
  email: string; // Giả sử user có trường 'email'
  categories: Category[]; // Khi populate, thuộc tính này sẽ tồn tại và là mảng Category
  // Thêm các trường trực tiếp khác của user nếu bạn truy cập chúng
  // Ví dụ: createdAt, updatedAt, confirmed, blocked, etc.
}

// Định nghĩa interface cho dữ liệu Post được trả về từ entityService
interface PostData {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  clickCount: number;
  thumbnail?: any;
  author?: any;
  categories?: Category[]; // Post có thể có categories, tùy thuộc vào populate
  source?: any; // Kiểu dữ liệu cho source nếu có, hoặc định nghĩa interface cụ thể
  // Thêm các trường khác của Post nếu bạn truy cập chúng
}

// Định nghĩa interface cho bài viết gợi ý (chỉ có id, title, slug)
interface SuggestedPost {
  id: number;
  title: string;
  slug: string;
}

/**
 * A set of functions called "actions" for `recommendation`
 */
export default {
  /**
   * GET /api/recommendations/unauthenticated
   * Đề xuất công khai cho người dùng chưa đăng nhập.
   * Logic: các bài viết trong ngày, sắp xếp theo clickCount, cộng thêm các bài viết có nhiều lượt xem nhất nếu số lượng chưa đủ.
   */
  async getUnauthenticatedRecommendations(ctx: Context) {
    try {
      // Xây dựng chuỗi ngày YYYY-MM-DD
      const today = new Date().toISOString().split('T')[0];

      // 1) Lấy các bài viết được xuất bản từ nửa đêm hôm nay, sắp xếp theo clickCount
      let posts = await strapi.entityService.findMany('api::post.post', {
        filters: { publishedAt: { $gte: `${today}T00:00:00.000Z` } },
        fields: ['id', 'title', 'slug', 'publishedAt', 'clickCount'],
        sort: { clickCount: 'desc' },
        populate: {
          thumbnail: { fields: ['url'] },
          author: {
            fields: ['username'], // Chỉ lấy các trường cần thiết của author
            populate: {
              avatar: { fields: ['url'] }, // Populate avatar của author
            },
          },
          categories: { fields: ['name', 'slug'] },
        },
      }) as PostData[]; // Ép kiểu kết quả trả về là mảng PostData

      // 2) Nếu số lượng bài viết < 10, lấy thêm các bài viết có clickCount cao nhất
      if (posts.length < 10) {
        const postIdsToExclude = posts.map(p => p.id);
        const extra = await strapi.entityService.findMany('api::post.post', {
          filters: {
            id: { $notIn: postIdsToExclude }, // Loại bỏ các bài đã có để tránh trùng lặp
          },
          fields: ['id', 'title', 'slug', 'publishedAt', 'clickCount'],
          sort: { clickCount: 'desc' },
          limit: 10 - posts.length, // Chỉ lấy số lượng còn thiếu
          populate: {
            thumbnail: { fields: ['url'] },
            author: {
              fields: ['username'],
              populate: {
                avatar: { fields: ['url'] },
              },
            },
            categories: { fields: ['name', 'slug'] },
          },
        }) as PostData[]; // Ép kiểu kết quả trả về là mảng PostData
        posts.push(...extra);
      }

      // 3) Trả về một mảng các đối tượng bài viết đã được chọn lọc
      ctx.body = posts;
    } catch (error: any) {
      console.error('Lỗi khi lấy bài viết đề xuất cho người dùng chưa đăng nhập:', error);
      ctx.body = { error: 'Failed to fetch recommendations', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * GET /api/recommendations/authenticated
   * Đề xuất cá nhân hóa cho người dùng đã đăng nhập dựa trên sở thích (danh mục yêu thích).
   */
  async getAuthenticatedRecommendations(ctx: Context) {
    try {
      // Lấy ID của người dùng đã đăng nhập từ context
      const userId = ctx.state.user?.id; // Sử dụng optional chaining để an toàn hơn
      if (!userId) {
        return ctx.unauthorized('Bạn cần đăng nhập để xem đề xuất này.');
      }

      // 1) Lấy thông tin người dùng, bao gồm các danh mục yêu thích của họ
      // Ép kiểu kết quả sang PopulatedUser ngay lập tức
      const user = (await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
        populate: ['categories'], // Sử dụng mảng chuỗi
      })) as PopulatedUser;

      // Kiểm tra nếu user không tồn tại hoặc không có categories
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
        fields: ['id', 'title', 'slug', 'publishedAt', 'clickCount'],
        sort: { publishedAt: 'desc' },
        populate: {
          thumbnail: { fields: ['url'] },
          author: {
            fields: ['username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          categories: { fields: ['name', 'slug'] },
        },
      }) as PostData[]; // Ép kiểu kết quả trả về là mảng PostData

      // 4) Trả về một mảng các đối tượng bài viết đã được chọn lọc
      ctx.body = posts;
    } catch (error: any) {
      console.error('Lỗi khi lấy bài viết đề xuất cho người dùng đã đăng nhập:', error);
      ctx.body = { error: 'Failed to fetch recommendations', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * GET /api/recommendations/related/:id
   * Đề xuất các bài viết liên quan dựa trên các danh mục của bài viết hiện tại.
   */
  async getRelatedPosts(ctx: Context) {
    try {
      // Lấy ID của bài viết hiện tại từ params
      const postId = ctx.params.id;

      // 1) Lấy bài viết hiện tại cùng với các danh mục của nó
      const currentPost = await strapi.entityService.findOne('api::post.post', postId, {
        // Chỉ lấy ID của danh mục để tối ưu
        populate: {
          categories: { fields: ['id'] }
        },
      }) as PostData; // Ép kiểu kết quả trả về là PostData

      if (!currentPost) {
        return ctx.notFound('Bài viết không tồn tại.');
      }

      // Đảm bảo currentPost.categories tồn tại trước khi map
      if (!currentPost.categories || currentPost.categories.length === 0) {
        return ctx.body = { error: 'Bài viết hiện tại không có danh mục để đề xuất liên quan.' };
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
        fields: ['id', 'title', 'slug', 'publishedAt', 'clickCount'],
        sort: { clickCount: 'desc' }, // Thay đổi: Sắp xếp theo lượt click cao nhất
        limit: 3, // Giới hạn số lượng bài viết liên quan là 3
        populate: {
          thumbnail: { fields: ['url'] },
          author: {
            fields: ['username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          categories: { fields: ['name', 'slug'] },
        },
      }) as PostData[]; // Ép kiểu kết quả trả về là mảng PostData

      // 4) Trả về một mảng các đối tượng bài viết đã được chọn lọc
      ctx.body = relatedPosts;
    } catch (error: any) {
      console.error('Lỗi khi lấy bài viết liên quan:', error);
      // Trả về mảng rỗng khi có lỗi để tránh làm hỏng giao diện client
      ctx.body = [];
    }
  },

  /**
   * GET /api/recommendations/search?q=<query>&page=<page>
   * Tìm kiếm bài viết. Nếu người dùng đã đăng nhập, ưu tiên tìm kiếm trong các danh mục yêu thích.
   * Nếu không có từ khóa tìm kiếm, sẽ trả về danh sách bài viết mới nhất (giống trang chủ).
   */
  async searchPosts(ctx: Context) {
    try {
      // Thêm 'category' (slug) vào các tham số query
      const { q, page = 1, pageSize = 10, category } = ctx.query;
      const start = (parseInt(page as string, 10) - 1) * parseInt(pageSize as string, 10); // Ép kiểu rõ ràng

      const userId = ctx.state.user?.id; // Có thể là undefined nếu chưa đăng nhập
      let filters: any = {}; // Sử dụng any cho filters để linh hoạt với các cấu trúc khác nhau

      // Nếu có từ khóa tìm kiếm, áp dụng bộ lọc tìm kiếm
      if (q) {
        filters.$or = [
          { title: { $containsi: q } },
          { content: { $containsi: q } },
        ];
      }

      // Nếu có slug của category, luôn lọc theo category đó
      if (category) {
        filters.categories = { slug: { $eq: category } };
      } else if (userId) {
        // Nếu không có category cụ thể và người dùng đã đăng nhập, ưu tiên tìm trong danh mục yêu thích
        const user = (await strapi.entityService.findOne('plugin::users-permissions.user', userId, {
          populate: ['categories'], // Sử dụng mảng chuỗi
        })) as PopulatedUser;

        if (user?.categories?.length > 0) {
          const preferredCategoryIds = user.categories.map(cat => cat.id);
          filters.categories = { id: { $in: preferredCategoryIds } };
        }
      }

      const posts = await strapi.entityService.findMany('api::post.post', {
        filters,
        fields: ['id', 'title', 'slug', 'publishedAt', 'clickCount'],
        sort: { publishedAt: 'desc' },
        start,
        limit: parseInt(pageSize as string, 10), // Ép kiểu rõ ràng
        populate: {
          thumbnail: { fields: ['url'] },
          author: {
            fields: ['username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          categories: { fields: ['name', 'slug'] },
        },
      }) as PostData[]; // Ép kiểu kết quả trả về là mảng PostData

      const count = await strapi.entityService.count('api::post.post', { filters });
        
      const response = {
        data: posts,
        meta: {
          pagination: {
            page: parseInt(page as string, 10),
            pageSize: parseInt(pageSize as string, 10),
            pageCount: Math.ceil(count / parseInt(pageSize as string, 10)),
            total: count,
          },
        },
      };

      ctx.body = response;
    } catch (error: any) {
      console.error('Lỗi khi tìm kiếm bài viết:', error);
      ctx.body = { error: 'Failed to search posts', details: error.message };
      ctx.response.status = 500;
    }
  },

  /**
   * GET /api/recommendations/category-info/:slug
   * Lấy thông tin cơ bản của một danh mục dựa trên slug.
   */
  async getCategoryInfo(ctx: Context) {
    try {
      const { slug } = ctx.params;
      const categories = await strapi.entityService.findMany('api::category.category', {
        filters: { slug: { $eq: slug } },
        fields: ['name', 'slug'], // Chỉ lấy các trường cần thiết
      });

      if (!categories || categories.length === 0) {
        return ctx.notFound('Không tìm thấy danh mục.');
      }

      ctx.body = categories[0]; // Trả về đối tượng category đầu tiên tìm thấy
    } catch (error: any) {
      console.error('Lỗi khi lấy thông tin danh mục:', error);
      ctx.body = { error: 'Failed to fetch category info' };
      ctx.response.status = 500;
    }
  },

  /**
   * GET /api/recommendations/trending-categories
   * Lấy các danh mục nổi bật, sắp xếp theo số lượng bài viết.
   */
  async getTrendingCategories(ctx: Context) {
    try {
      // Lấy tất cả danh mục, và populate quan hệ 'posts'
      // TỐI ƯU: Thay vì populate toàn bộ bài viết, chỉ cần đếm số lượng.
      const categories = await strapi.entityService.findMany('api::category.category', {
        populate: { // TypeScript không nhận diện được 'count', ta dùng 'as any' để bỏ qua kiểm tra kiểu
          posts: {
            count: true,
          },
        } as any,
      });

      // Sắp xếp danh mục dựa trên số lượng bài viết giảm dần
      const sortedCategories = categories
        .map(category => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          postCount: category.posts.count,
        }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 5); // Lấy 5 danh mục hàng đầu

      ctx.body = sortedCategories;
    } catch (error: any) {
      console.error('Lỗi khi lấy danh mục nổi bật:', error);
      ctx.body = { error: 'Failed to fetch trending categories', details: error.message };
      ctx.response.status = 500;
    }
  },
  
  /**
   * GET /api/recommendations/suggestions?q=<query>
   * Đề xuất các bài viết dựa trên tiêu đề khớp một phần với từ khóa.
   */
  async suggestPosts(ctx: Context) {
    try {
      const { q } = ctx.query;
      const limit = 7;

      if (!q || (q as string).length < 2) { // Ép kiểu q sang string để đảm bảo .length hoạt động
        return ctx.body = [];
      }

      const posts = (await strapi.entityService.findMany('api::post.post', {
        filters: {
          title: {
            $containsi: q,
          },
        },
        sort: { publishedAt: 'desc' },
        limit,
        fields: ['id', 'title', 'slug'], // Chỉ lấy các trường cần thiết để tăng tốc độ
      })) as SuggestedPost[]; // Ép kiểu kết quả trả về là mảng SuggestedPost

      ctx.body = posts.map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
      }));

    } catch (error: any) {
      console.error('Lỗi khi lấy gợi ý tìm kiếm:', error);
      ctx.body = []; // Trả về mảng rỗng khi có lỗi
    }
  },
};
