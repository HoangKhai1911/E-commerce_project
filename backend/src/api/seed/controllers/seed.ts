'use strict';

import { Context } from 'koa';

export default {
  async seed(ctx: Context) {
    try {
      await strapi.db.query('plugin::users-permissions.user').create({
        data: {
          username: 'demo_user',
          email: 'demo@example.com',
          password: '123456',
        },
      });

      ctx.send({ message: '✅ Seed completed!' });
    } catch (error: unknown) {
      const err = error as Error;
      ctx.send({
        error: '❌ Seed failed!',
        details: err.message,
      });
    }
  },
};