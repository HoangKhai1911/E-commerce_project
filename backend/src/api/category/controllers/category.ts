'use strict';

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

// Định nghĩa interface cho Post để sử dụng trong Category
interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
  excerpt?: string;
  clickCount?: number;
  thumbnail?: { url: string };
  author?: { username: string; avatar?: { url: string } };
  categories?: Array<{ id: number; name: string; slug: string }>;
  source?: { id: number; name: string; url?: string };
}

// Định nghĩa interface cho Category khi populate posts
interface CategoryWithPosts {
  id: number;
  name: string;
  slug: string;
  posts?: Post[]; // Mảng các bài viết liên quan
  // Thêm các trường khác của category nếu cần
}

/**
 * category controller
 */
export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  /**
   * Tùy chỉnh hành động tìm kiếm (find) để đảm bảo populate các quan hệ cần thiết.
   * Đây là handler cho GET /api/categories
   * @param {object} ctx
   */
  async find(ctx: Context) {
    console.log('--- Custom Category find called (extending core controller) ---');

    // Trích xuất các tham số query cho filters, pagination, sort
    const { query } = ctx;

    // Đảm bảo 'filters' luôn là một đối tượng
    const filters = (typeof query.filters === 'object' && query.filters !== null)
      ? query.filters
      : {};

    const pagination = query.pagination;
    const sort = query.sort;

    // Định nghĩa các tùy chọn populate mặc định cho find (lấy tất cả danh mục)
    const defaultPopulate = {
      posts: {
        fields: ['id', 'title', 'slug', 'publishedAt'], // Lấy các trường cần thiết của post
      },
      // Thêm các quan hệ khác ở đây nếu cần, ví dụ: 'sources'
    };

    try {
      // Sử dụng strapi.entityService.findMany trực tiếp để lấy dữ liệu
      const entries = await strapi.entityService.findMany('api::category.category', {
        filters: filters,
        populate: defaultPopulate,
        pagination: pagination,
        sort: sort,
      });

      // Lấy tổng số lượng bản ghi cho metadata phân trang
      const count = await strapi.entityService.count('api::category.category', { filters });

      // Chuyển đổi các bản ghi để phù hợp với định dạng phản hồi API mặc định của Strapi (data và meta)
      const transformedEntries = entries.map((entry: any) => {
        const { id, ...attributes } = entry;
        // Giữ lại việc tùy chỉnh `posts` nếu cần, nhưng đảm bảo cấu trúc chính xác
        attributes.posts = attributes.posts ? attributes.posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            publishedAt: post.publishedAt,
        })) : [];
        return { id, attributes };
      });

      // Tính toán metadata phân trang
      const page = parseInt((pagination as any)?.page as string || '1', 10);
      const pageSize = parseInt((pagination as any)?.pageSize as string || '25', 10);

      const response = {
        data: transformedEntries,
        meta: {
          pagination: {
            page: page,
            pageSize: pageSize,
            pageCount: Math.ceil(count / pageSize),
            total: count,
          },
        },
      };

      console.log('--- Custom Category find response (direct entityService) ---');
      console.log(JSON.stringify(response, null, 2));
      console.log('------------------------------------------------------------');

      ctx.body = response;
      return response;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách danh mục (direct entityService):', error);
      ctx.internalServerError('Lỗi khi lấy danh sách danh mục.');
    }
  },

  /**
   * Tùy chỉnh hành động tìm kiếm một bản ghi (findOne) theo ID hoặc slug.
   * Đây là handler cho GET /api/categories/:id hoặc /api/categories/:slug
   * @param {object} ctx
   */
  async findOne(ctx: Context) {
    console.log('--- Custom Category findOne called ---');
    const { id } = ctx.params;

    // 1. Đặt populate mặc định nếu client không cung cấp.
    if (!ctx.query.populate) {
      (ctx.query as any).populate = {
        posts: {
          fields: ['id', 'title', 'slug', 'publishedAt'], // Chỉ lấy ID, title, slug của post
        },
      };
    }

    // 2. Kiểm tra xem 'id' có phải là slug hay không.
    if (isNaN(Number(id))) {
      console.log(`Finding category by slug: ${id}`);
      try {
        // Use type assertion to avoid TypeScript error
        (ctx.query as any).filters = { slug: { $eq: id } };

        // Use findMany and get the first element
        const { data } = await super.find(ctx);

        if (data && data.length > 0) {
          // Manually transform the response for a single entity
          return this.transformResponse(data[0]);
        } else {
          return ctx.notFound('Không tìm thấy danh mục.');
        }
      } catch (error: any) {
        console.error('❌ Lỗi khi lấy chi tiết danh mục bằng slug:', error);
        ctx.internalServerError('Lỗi khi lấy chi tiết danh mục.');
      }
    }

    // 3. Nếu là ID, để core controller xử lý.
    console.log(`Finding category by ID: ${id}`);
    return super.findOne(ctx);
  },
}));
