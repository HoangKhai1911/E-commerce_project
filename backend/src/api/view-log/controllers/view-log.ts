'use strict';
/**
 * view-log controller
 */

module.exports = {
  /**
   * Lấy dữ liệu thống kê tổng quan cho trang Dashboard.
   * GET /api/view-log/stats
   * @param {object} ctx
   */
  async stats(ctx) {
    try {
      // Sử dụng Promise.all để thực hiện các truy vấn song song, tăng hiệu suất
      const [
        postCount,
        userCount,
        categoryCount,
        topPosts,
        allCategoriesWithPostCount,
      ] = await Promise.all([
        // 1. Đếm tổng số bài viết
        strapi.entityService.count('api::post.post'),
        // 2. Đếm tổng số người dùng
        strapi.entityService.count('plugin::users-permissions.user'),
        // 3. Đếm tổng số danh mục
        strapi.entityService.count('api::category.category'),
        // 4. Lấy 5 bài viết có lượt xem cao nhất
        strapi.entityService.findMany('api::post.post', {
          fields: ['id', 'title', 'slug', 'clickCount'],
          sort: { clickCount: 'desc' },
          limit: 5,
          populate: { author: { fields: ['username'] } },
        }),
        // 5. Lấy tất cả danh mục và đếm số bài viết trong mỗi danh mục
        strapi.db.query('api::category.category').findMany({
          populate: { posts: { count: true } },
        }),
      ]);

      // Sắp xếp, định dạng và lấy top 5 danh mục có nhiều bài viết nhất
      const topCategoriesByPostCount = allCategoriesWithPostCount
        .map(c => ({ id: c.id, name: c.name, slug: c.slug, postCount: c.posts?.count || 0 }))
        .sort((a, b) => b.postCount - a.postCount)
        .slice(0, 5);

      // Trả về tất cả dữ liệu trong một object duy nhất
      ctx.send({
        posts: postCount,
        users: userCount,
        categories: categoryCount,
        topPostsByClicks: topPosts,
        topCategoriesByPostCount,
      });
    } catch (error) {
      strapi.log.error('Lỗi khi lấy dữ liệu thống kê tổng quan:', error);
      ctx.internalServerError('Không thể lấy dữ liệu thống kê.', { error });
    }
  },

  /**
   * Lấy dữ liệu lượt xem hàng ngày trong 30 ngày qua.
   * GET /api/view-log/daily-views
   * @param {object} ctx
   */
  async dailyViews(ctx) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const model = strapi.getModel('api::view-log.view-log');
      const knex = strapi.db.connection;
      const dbDriver = strapi.config.get('database.connection.client');

      // Sử dụng Knex query builder thay vì raw query để tương thích nhiều CSDL.
      // SQLite sử dụng strftime, trong khi PostgreSQL/MySQL sử dụng DATE.
      const dateColumnExpression = dbDriver === 'sqlite'
        ? "strftime('%Y-%m-%d', created_at)"
        : 'DATE(created_at)';

      const results = await knex(model.collectionName)
        .select(
          knex.raw(`${dateColumnExpression} as date`),
          knex.raw('COUNT(id) as views')
        )
        .where('created_at', '>=', thirtyDaysAgo.toISOString())
        .groupByRaw(dateColumnExpression)
        .orderBy('date', 'asc');

      // Knex query builder trả về một mảng kết quả nhất quán trên các CSDL khác nhau,
      // không cần xử lý `result.rows || result` như khi dùng knex.raw với PostgreSQL.
      ctx.send(results);
    } catch (error) {
      strapi.log.error('Lỗi khi lấy dữ liệu lượt xem hàng ngày:', error);
      ctx.internalServerError('Không thể lấy dữ liệu lượt xem hàng ngày.', { error });
    }
  },
};
