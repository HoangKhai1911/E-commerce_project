// src/middlewares/rateLimit/index.ts
import type { Strapi } from '@strapi/strapi';
const ratelimit = require('koa-ratelimit');
const LRU = require('lru-cache');

export default (config: any, { strapi }: { strapi: Strapi }) => {
  const limiter = ratelimit({
    driver: 'memory',
    db: new LRU({ max: 100 }),
    duration: config.duration || 60000,
    errorMessage: config.errorMessage || 'Too many requests, slow down...',
    max: config.max || 20,
    id: (ctx: any) => ctx.ip,
    disableHeader: config.disableHeader || false,
  });

  return async (ctx: any, next: () => Promise<any>) => {
    const isClickRoute =
      ctx.method === 'POST' &&
      /^\/api\/posts\/\d+\/click$/.test(ctx.path);

    if (isClickRoute) {
      // gọi limiter (nội bộ sẽ gọi next nếu chưa vượt limit)
      return limiter(ctx, next);
    }

    // route khác thì chỉ next bình thường
    return next();
  };
};