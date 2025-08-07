'use strict';

/**
 * category controller
 * This controller extends the core controller, allowing us to customize specific actions
 * while still leveraging the default logic for create, update, and delete.
 */

import { factories } from '@strapi/strapi';
import type { Context } from 'koa';
//import type { Category, Post, CategoryWithPosts } from '@/type';

// The following interfaces are defined for clarity and are not part of the controller's core logic.
interface Post {
  id: number;
  title: string;
  slug: string;
  publishedAt: string;
}

interface CategoryWithPosts {
  id: number;
  name: string;
  slug: string;
  posts?: Post[];
}

// We extend the core controller using `createCoreController`.
// `super` keyword will give us access to the default Strapi controller methods.
export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  /**
   * We override the `find` action to include default populate options for the 'posts' relation.
   * This ensures that when we fetch a list of categories, a sanitized list of related posts is
   * always returned, unless the client specifies their own `populate` query.
   * By calling `super.find(ctx)`, we let the core controller handle all the heavy lifting
   * (filtering, pagination, sorting, sanitization, and response transformation).
   * @param {object} ctx
   */
  async find(ctx: Context) {
    console.log('--- Custom Category find called (extending core controller) ---');

    // 1. Set default populate if not provided by the client.
    // This is the cleanest way to ensure relations are always loaded.
    if (!ctx.query.populate) {
      (ctx.query as any).populate = {
        posts: {
          fields: ['id', 'title', 'slug', 'publishedAt'],
        },
      };
    }

    try {
      // 2. Call the default 'find' action from the core controller.
      // The core controller will handle all the logic:
      // - Fetching data with filters, sort, pagination, and our custom populate.
      // - Sanitizing the output based on permissions.
      // - Transforming the response to the standard { data, meta } format.
      const response = await super.find(ctx);

      // We can add custom logic here if needed to modify the response before sending it.
      // For this case, we just return the standard response.
      return response;
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách danh mục:', error);
      ctx.internalServerError('Lỗi khi lấy danh sách danh mục.');
    }
  },

  /**
   * We override the `findOne` action to also handle finding by slug in addition to ID.
   * Like the `find` method, we use `super.findOne` to leverage Strapi's core functionality.
   * @param {object} ctx
   */
  async findOne(ctx: Context) {
    console.log('--- Custom Category findOne called ---');
    const { id } = ctx.params;
    
    // Check if the parameter is a slug.
    if (isNaN(Number(id))) {
      console.log(`Finding category by slug: ${id}`);
      
      // If it's a slug, we need to manually query the database.
      // Set the populate option for this query.
      const defaultPopulate = {
        posts: {
          fields: ['id', 'title', 'slug', 'publishedAt'],
        },
      };
      
      const entities = await strapi.entityService.findMany('api::category.category', {
        filters: { slug: { $eq: id } },
        populate: ctx.query.populate || defaultPopulate,
        limit: 1,
      }) as CategoryWithPosts[];
      
      const category = entities[0];
      
      if (!category) {
        return ctx.notFound('Không tìm thấy danh mục.');
      }
      
      // Since we bypassed the core controller's findOne, we must
      // manually sanitize and transform the response.
      const sanitizedEntity = await this.sanitizeOutput(category, ctx);
      return this.transformResponse(sanitizedEntity);
    }
    
    // If it's a number, it's an ID. Let the core controller handle it.
    console.log(`Finding category by ID: ${id}`);
    
    // Set default populate if not provided by the client.
    if (!ctx.query.populate) {
        (ctx.query as any).populate = {
            posts: {
                fields: ['id', 'title', 'slug', 'publishedAt'],
            },
        };
    }
    
    // Use `super.findOne` for the rest of the logic.
    return super.findOne(ctx);
  },
}));
