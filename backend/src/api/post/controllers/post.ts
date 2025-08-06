'use strict';

/**
 * post controller
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

// Định nghĩa interface cho Category
interface Category {
  id: number;
  name: string;
  slug: string;
}

// Định nghĩa interface cho Avatar (Media file)
interface Avatar {
  id: number;
  url: string;
  // Thêm các trường khác của avatar nếu bạn truy cập chúng
}

// Định nghĩa interface cho Author (User)
interface Author {
  id: number;
  username: string;
  avatar?: Avatar; // Avatar của tác giả
  // Thêm các trường khác của author nếu bạn truy cập chúng
}

// Định nghĩa interface cho Source
interface Source {
  id: number;
  name: string;
  url: string; // Đảm bảo trường 'url' có ở đây
}

// Định nghĩa interface cho dữ liệu Post được trả về từ entityService
interface PostData {
  id: number;
  title: string;
  slug: string;
  content?: string; // Nội dung bài viết
  excerpt?: string; // Đoạn trích bài viết
  publishedAt: string;
  clickCount?: number;
  thumbnail?: { url: string }; // Thumbnail của bài viết
  author?: Author; // Tác giả bài viết
  categories?: Category[]; // Danh mục bài viết
  source?: Source; // Nguồn bài viết
  // Thêm các trường khác của Post nếu bạn truy cập chúng
}


// We extend the core controller to keep all default functionalities
export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  
  /**
   * Custom action to find a single post by its slug.
   * This will be mapped to the GET /posts/:slug route.
   */
  async findOneBySlug(ctx: Context) {
    const { slug } = ctx.params;
    const { populate } = ctx.query; // Lấy populate từ query params, có thể là '*'

    if (!slug) {
      return ctx.badRequest('Slug parameter is missing.');
    }

    try {
      // Xử lý populate một cách tường minh hơn
      // Strapi's entityService can handle the populate query parameter directly.
      // The complex logic to parse it is not needed.

      // Sử dụng entityService.findMany để tìm bài viết bằng slug
      const entity = await strapi.entityService.findMany('api::post.post', {
        filters: { slug: { $eq: slug } }, // Chỉ lọc theo slug
        populate: populate || '*', // Pass the populate param directly, or default to '*'
        limit: 1, // Chỉ lấy một bài viết
      }) as PostData[]; // Ép kiểu kết quả trả về là mảng PostData

      const post = entity[0]; // Lấy bài viết đầu tiên (nếu có)

      if (!post) {
        return ctx.notFound('Không tìm thấy bài viết.');
      }

      // Tăng lượt xem (fire-and-forget) để không làm chậm phản hồi API
      strapi.entityService.update('api::post.post', post.id, {
        data: {
          clickCount: (post.clickCount || 0) + 1,
        } as any, // Ép kiểu để tránh lỗi TypeScript
      }).catch((err: any) => console.error(`Failed to update click count for post ${post.id}:`, err));

      // Sanitize the output to respect roles and permissions
      const sanitizedEntity = await this.sanitizeOutput(post, ctx);

      return this.transformResponse(sanitizedEntity);
    } catch (error: any) {
      console.error('Lỗi khi lấy bài viết bằng slug:', error);
      ctx.internalServerError('Lỗi khi lấy bài viết bằng slug.');
    }
  },

  /**
   * Custom action to record a click on a post.
   * This will be mapped to the PUT /posts/:id/click route.
   */
  async recordClick(ctx: Context) {
    const { id } = ctx.params;

    try {
      const post = await strapi.entityService.findOne('api::post.post', id, {
        fields: ['clickCount']
      });

      if (!post) {
        return ctx.notFound('Post not found');
      }

      // Use entityService to update the click count
      const updatedPost = await strapi.entityService.update('api::post.post', id, {
        data: {
          clickCount: (post.clickCount || 0) + 1,
        } as any, // <-- Sửa lỗi ở đây: Ép kiểu đối tượng data thành any
      });

      return this.transformResponse(updatedPost);
    } catch (error: any) {
      console.error('Lỗi khi ghi nhận lượt click:', error);
      ctx.internalServerError('Ghi nhận lượt click không thành công. Vui lòng thử lại.');
    }
  }
}));
