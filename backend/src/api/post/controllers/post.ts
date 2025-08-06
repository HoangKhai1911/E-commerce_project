'use strict';

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
}

// Định nghĩa interface cho Author (User)
interface Author {
  id: number;
  username: string;
  avatar?: Avatar;
}

// Định nghĩa interface cho Source
interface Source {
  id: number;
  name: string;
  url: string;
}

// Định nghĩa interface cho dữ liệu Post được trả về từ entityService
interface PostData {
  id: number;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  publishedAt: string;
  clickCount?: number;
  thumbnail?: { url: string };
  author?: Author;
  categories?: Category[];
  source?: Source;
}

export default factories.createCoreController('api::post.post', ({ strapi }) => ({
  /**
   * Tùy chỉnh hành động tìm kiếm (find) để xử lý populate và filters một cách an toàn.
   * Đây là handler cho GET /api/posts
   * @param {object} ctx
   */
  async find(ctx: Context) {
    console.log('--- Custom Post find called ---');
    console.log('ctx.query BEFORE processing:', ctx.query);
    console.log('-----------------------------');

    const { query } = ctx;

    // Default populate options
    const defaultPopulate = {
      categories: { fields: ['name', 'slug'] },
      source: { fields: ['name', 'url'] },
      thumbnail: { fields: ['url'] },
      author: {
        fields: ['username'],
        populate: {
          avatar: { fields: ['url'] },
        },
      },
    };

    // Determine the populate to use: either from query or our default
    let populateOptions: any = (query as any).populate;
    if (!populateOptions || populateOptions === '*') {
        populateOptions = defaultPopulate;
    } else if (typeof populateOptions === 'string') {
        // If frontend sends "populate=categories,author", convert to array
        populateOptions = populateOptions.split(',');
    }

    // Manually construct the filters object to ensure correct structure
    let processedFilters: any = {};
    if (query.filters && typeof query.filters === 'object') {
        // Deep copy filters to avoid modifying original ctx.query directly
        processedFilters = JSON.parse(JSON.stringify(query.filters));

        // Special handling for nested filters like filters[categories][slug][$eq]
        // The frontend sends `filters[categories][slug][$eq]=cong-nghe`
        // Koa parses it as `ctx.query.filters.categories.slug = { '$eq': 'cong-nghe' }`
        // We need to ensure this structure is preserved.
        if (
            processedFilters.categories &&
            processedFilters.categories.slug &&
            typeof processedFilters.categories.slug === 'object' &&
            processedFilters.categories.slug.$eq !== undefined
        ) {
            // This structure { $eq: 'value' } is correct for Strapi's entityService.
            // No need to flatten it to a string.
        }

        // Handle source filter if present (e.g., filters[source][id][$eq]=1)
        if (processedFilters.source &&
            processedFilters.source.id &&
            typeof processedFilters.source.id === 'object' &&
            processedFilters.source.id.$eq !== undefined) {
            // Ensure source.id remains as { $eq: value }
        }
    }

    const pagination = query.pagination;
    const sort = query.sort;

    try {
      const entries = await strapi.entityService.findMany('api::post.post', {
        filters: processedFilters, // Sử dụng filters đã được xử lý
        populate: populateOptions,
        pagination: pagination,
        sort: sort,
      });

      // Get total count for pagination metadata
      const count = await strapi.entityService.count('api::post.post', { filters: processedFilters });

      // Transform entries to match Strapi's default API response format (data and meta)
      // This transformation is crucial because entityService.findMany returns raw data
      // while the frontend expects the standard Strapi API response format.
      const transformedEntries = entries.map((entry: any) => ({
        id: entry.id,
        attributes: {
          ...entry, // Spread all direct attributes
          // Ensure relationships are nested correctly under 'attributes' with data/attributes wrappers
          categories: entry.categories ? {
            data: entry.categories.map((cat: any) => ({
              id: cat.id,
              attributes: {
                name: cat.name,
                slug: cat.slug,
              }
            }))
          } : { data: [] },
          source: entry.source ? {
            data: {
              id: entry.source.id,
              attributes: {
                name: entry.source.name,
                url: entry.source.url,
              }
            }
          } : undefined,
          thumbnail: entry.thumbnail ? {
            data: {
              id: entry.thumbnail.id,
              attributes: {
                url: entry.thumbnail.url,
              }
            }
          } : undefined,
          author: entry.author ? {
            data: {
              id: entry.author.id,
              attributes: {
                username: entry.author.username,
                avatar: entry.author.avatar ? {
                  data: {
                    id: entry.author.avatar.id,
                    attributes: {
                      url: entry.author.avatar.url,
                    }
                  }
                } : undefined,
              }
            }
          } : undefined,
        }
      }));

      // Calculate pagination metadata
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

      console.log('--- Custom Post find response (direct entityService) ---');
      console.log(JSON.stringify(response, null, 2));
      console.log('------------------------------------------------------------');

      ctx.body = response; // Set response body
      return response; // Return response
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy danh sách bài viết (direct entityService):', error);
      ctx.internalServerError('Lỗi khi lấy danh sách bài viết.');
    }
  },

  /**
   * GET /api/posts/:slug
   * Lấy một bài viết bằng slug, đồng thời tăng lượt xem.
   * Đây là một custom action để hỗ trợ URL thân thiện với SEO.
   */
  async findOneBySlug(ctx: Context) {
    const { slug } = ctx.params;
    const cleanSlug = slug.trim(); // Loại bỏ khoảng trắng hoặc xuống dòng
    const { populate } = ctx.query;

    if (!cleanSlug) {
      return ctx.badRequest('Slug parameter is missing.');
    }

    console.log('[Slug]', slug, '| [Cleaned]', cleanSlug);

    try {
      // Xử lý populate một cách tường minh hơn
      let actualPopulate: any = {};
      if (populate === '*') {
        actualPopulate = {
          thumbnail: { fields: ['url'] },
          author: {
            fields: ['username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          categories: { fields: ['name', 'slug'] },
          source: { fields: ['name', 'url'] },
        };
      } else if (populate && typeof populate === 'object') {
        actualPopulate = populate;
      } else if (Array.isArray(populate)) {
        actualPopulate = populate;
      } else if (typeof populate === 'string' && populate.includes(',')) {
        actualPopulate = populate.split(',');
      } else {
        actualPopulate = {
          thumbnail: { fields: ['url'] },
          author: {
            fields: ['username'],
            populate: {
              avatar: { fields: ['url'] },
            },
          },
          categories: { fields: ['name', 'slug'] },
          source: { fields: ['name', 'url'] },
        };
      }

      const entity = await strapi.entityService.findMany('api::post.post', {
        filters: { slug: { $eq: cleanSlug } },
        populate: actualPopulate, // Sử dụng đối tượng populate đã được xử lý
        limit: 1,
      }) as PostData[];

      const post = entity[0];

      if (!post) {
        return ctx.notFound('Không tìm thấy bài viết.');
      }

      // Fire-and-forget tăng lượt click
      strapi.entityService.update('api::post.post', post.id, {
        data: {
          clickCount: (post.clickCount || 0) + 1,
        } as any,
      }).catch((err: any) => console.error(`❌ Update clickCount failed:`, err));

      const sanitizedEntity = await this.sanitizeOutput(post, ctx);
      return this.transformResponse(sanitizedEntity);
    } catch (error: any) {
      console.error('❌ Lỗi khi lấy bài viết bằng slug:', error);
      ctx.internalServerError('Lỗi khi lấy bài viết bằng slug.');
    }
  },

  /**
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
