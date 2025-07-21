import { Context } from 'koa';
import runSeed from '../../../../scripts/seed';

export default {
  async seed(ctx: Context) {
    try {
      await runSeed({ strapi });
      ctx.body = '✅ Seed completed!';
    } catch (err) {
      console.error(err);
      ctx.status = 500;
      ctx.body = '❌ Seed failed!';
    }
  },
};
