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
    console.log('--- Custom Category find called (using entityService directly) ---');
    console.log('ctx.query:', ctx.query);
    console.log('----------------------------------------------------');

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
      const transformedEntries = entries.map((entry: any) => ({
        id: entry.id,
        attributes: {
          ...entry, // Trải tất cả các thuộc tính khác
          // Đảm bảo các quan hệ được lồng đúng cách dưới 'attributes'
          posts: entry.posts ? entry.posts.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            publishedAt: post.publishedAt,
          })) : [],
        }
      }));

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
    console.log('ctx.params:', ctx.params);
    console.log('ctx.query:', ctx.query);
    console.log('------------------------------------');

    const { id } = ctx.params; // Lấy ID hoặc slug từ params
    const { populate } = ctx.query; // Cho phép tùy chỉnh populate từ query params

    try {
      let category: CategoryWithPosts | null = null;

      // 🔴 SỬA LỖI Ở ĐÂY: Đơn giản hóa populate mặc định cho findOne
      // Chỉ populate các trường cơ bản của posts để kiểm tra
      const defaultPopulate = {
        posts: {
          fields: ['id', 'title', 'slug'], // Chỉ lấy ID, title, slug của post
          // Tạm thời bỏ populate sâu hơn của post để đơn giản hóa
        },
        // Thêm các quan hệ trực tiếp khác của category nếu cần
      };

      // Xử lý populate: nếu có populate từ query, sử dụng nó, nếu không, dùng defaultPopulate
      const actualPopulate = populate || defaultPopulate;

      // Kiểm tra xem 'id' có phải là một số nguyên (ID) hay là một chuỗi (slug)
      if (isNaN(Number(id))) { // Nếu không phải số, coi là slug
        console.log(`Finding category by slug: ${id}`);
        const entities = await strapi.entityService.findMany('api::category.category', {
          filters: { slug: { $eq: id } },
          populate: actualPopulate,
          limit: 1,
        }) as CategoryWithPosts[];
        category = entities[0] || null;
      } else { // Nếu là số, coi là ID
        console.log(`Finding category by ID: ${id}`);
        category = await strapi.entityService.findOne('api::category.category', id, {
          populate: actualPopulate,
        }) as CategoryWithPosts;
      }

      if (!category) {
        return ctx.notFound('Không tìm thấy danh mục.');
      }

      // Sanitize the output to respect roles and permissions
      const sanitizedEntity = await this.sanitizeOutput(category, ctx);

      // Trả về phản hồi đã được chuyển đổi
      return this.transformResponse(sanitizedEntity);
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy chi tiết danh mục:', error);
      ctx.internalServerError('Lỗi khi lấy chi tiết danh mục.');
    }
  },
}));
