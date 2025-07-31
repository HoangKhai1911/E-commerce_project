import { Context } from 'koa';
import { sanitize } from '@strapi/utils';

export default {
  async create(ctx: Context) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Bạn cần đăng nhập để thực hiện thao tác này.');
    }

    // ép kiểu ctx.request về any để TS không complain
    const payload = (ctx.request as any).body as { interests?: number[] };
    const interests = payload.interests;
    if (!Array.isArray(interests)) {
      return ctx.badRequest('Payload không hợp lệ. Vui lòng gửi mảng “interests”.');
    }
    if (interests.length < 3 || interests.length > 5) {
      return ctx.badRequest('Chọn tối thiểu 3 và tối đa 5 chủ đề yêu thích.');
    }

    await strapi.entityService.deleteMany(
      'api::user-preference.user-preference',
      { filters: { user: user.id } }
    );

    const created = await strapi.entityService.create(
      'api::user-preference.user-preference',
      {
        data: { user: user.id, interests },
        populate: ['interests'],
      }
    );

    const sanitized = await sanitize.contentAPI.output(
      created,
      strapi.getModel('api::user-preference.user-preference')
    );
    ctx.created({ data: sanitized });
  },

  async find(ctx: Context) {
    // ... tương tự như trước
  },
};