'use strict';

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

// It's a good practice to centralize your types, but for now, we define them here.
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Avatar { id: number; url: string; }

interface Author { id: number; username: string; avatar?: Avatar; }

interface Source { id: number; name: string; url: string; }

// This interface represents the data structure of a Post entity.
interface PostEntity {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  publishedAt: string;
  clickCount?: number;
  image?: { url: string; alternativeText?: string }[]; // Thay thumbnail bằng image
  author?: Author;
  categories?: Category[];
  source?: Source;
}

/**
 * Helper function to create a consistent populate object.
 * This ensures that all necessary relations are populated for both list and detail views.
 */
const getDefaultPopulate = () => ({
  image: { // Thay thumbnail bằng image
    fields: ['url', 'alternativeText'],
  },
  author: {
    populate: {
      avatar: {
        fields: ['url'],
      },
    },
  },
  categories: {
    fields: ['name', 'slug'],
  },
  source: {
    fields: ['name', 'url'],
  },
});

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  /**
   * Overriding the default find controller to ensure consistent data population.
   * GET /api/posts
   */
  async find(ctx: Context) {    
    // Ensure default population is always applied, merging with any client-side requests.
    const clientPopulate = ctx.query.populate;
    const defaultPopulate = getDefaultPopulate();

    if (typeof clientPopulate === 'object' && clientPopulate !== null) {
      (ctx.query as any).populate = { ...defaultPopulate, ...clientPopulate };
    } else {
      (ctx.query as any).populate = defaultPopulate;
    }

    // Call the core 'find' action and return its result.
    // Strapi's `super.find(ctx)` handles filtering, sorting, and pagination automatically.
    return super.find(ctx);
  },

  /**
   * Overriding the default findOne controller to ensure consistent data population.
   * GET /api/posts/:id (by numeric ID)
   */
  async findOne(ctx: Context) {
    // Similar to find, ensure default population is always applied.
    const clientPopulate = ctx.query.populate;
    const defaultPopulate = getDefaultPopulate();

    if (typeof clientPopulate === 'object' && clientPopulate !== null) {
      (ctx.query as any).populate = { ...defaultPopulate, ...clientPopulate };
    } else {
      (ctx.query as any).populate = defaultPopulate;
    }

    // Call the core 'findOne' action and return its result.
    return super.findOne(ctx);
  },

  /**
   * Custom action to find a post by its slug and increment the view count.
   * This is typically used for SEO-friendly URLs.
   * GET /api/posts/slug/:slug (requires a custom route to be configured)
   */
  async findOneBySlug(ctx: Context) {
    const { slug } = ctx.params;
    const { query } = ctx;

    if (!slug) {
      return ctx.badRequest('Slug parameter is missing.');
    }

    // Combine default populate with any client-side populate requests
    const clientPopulate = typeof query.populate === 'object' ? query.populate : {};
    const populateOptions = {
      ...getDefaultPopulate(),
      ...clientPopulate,
    };

    try {
      const entity = await strapi.entityService.findMany('api::post.post', {
        filters: { slug: { $eq: slug } },
        populate: populateOptions as any,
        limit: 1,
      }) as PostEntity[];

      const post = entity[0];

      if (!post) {
        return ctx.notFound('Không tìm thấy bài viết.');
      }

      // Ghi nhận lượt xem (fire-and-forget)
      // Các tác vụ này không nên làm chậm phản hồi cho người dùng.
      Promise.allSettled([
        // 1. Tăng tổng số lượt xem trên bài viết
        strapi.entityService.update('api::post.post', post.id, {
          data: { clickCount: (post.clickCount || 0) + 1 } as any,
        }),
        // 2. Ghi một bản ghi mới vào nhật ký xem để thống kê theo ngày
        strapi.entityService.create('api::view-log.view-log', {
          data: { post: post.id },
        }),
      ]).catch(errs => {
        strapi.log.error('Lỗi khi ghi nhận lượt xem hoặc cập nhật click count:', errs);
      });

      const sanitizedEntity = await this.sanitizeOutput(post, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy bài viết bằng slug:', error);
      ctx.internalServerError('Lỗi khi lấy bài viết bằng slug.');
    }
  },

  /**
   * Custom action to record a click on a post.
   * PUT /posts/:id/click
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

      // Tăng lượt click
      const updatedPost = await strapi.entityService.update('api::post.post', id, {
        data: {
          clickCount: (post.clickCount || 0) + 1,
        } as any,
      });

      return this.transformResponse(updatedPost);
    } catch (error: any) {
      console.error('❌ Lỗi khi ghi nhận lượt click:', error);
      ctx.internalServerError('Ghi nhận lượt click không thành công. Vui lòng thử lại.');
    }
  }
}));