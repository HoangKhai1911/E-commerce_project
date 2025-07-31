import { Context } from 'koa'

export default {
  async recordClick(ctx: Context) {
    const { id } = ctx.params

    // Thực thi UPDATE ... SET click_count = click_count + 1 RETURNING *
    // Lưu ý: tên bảng mặc định là "posts" (snake_case, plural của content-type)
    const [updated] = await strapi.db
      .connection('posts')
      .where({ id })
      .increment('click_count', 1)
      .returning(['id', 'click_count'])

    ctx.body = {
      success: true,
      data: {
        id: updated.id,
        clickCount: updated.click_count,
      },
    }
  },
}