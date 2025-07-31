'use strict';

module.exports = {
  /**
   * GET /api/recommendations/public
   * Public recommendations: today’s posts sorted by clickCount,
   * plus top-clicked extras if fewer than 10.
   */
  async public(ctx) {
    // build YYYY-MM-DD string
    const today = new Date().toISOString().split('T')[0];

    // 1) posts published since midnight today, sorted by clickCount
    let posts = await strapi.entityService.findMany('api::post.post', {
      filters: { published: { $gte: `${today}T00:00:00Z` } },
      sort: { clickCount: 'desc' },
      limit: 20,
    });

    // 2) if < 10, fetch top-clicked overall
    if (posts.length < 10) {
      const extra = await strapi.entityService.findMany('api::post.post', {
        sort: { clickCount: 'desc' },
        limit: 20 - posts.length,
      });
      posts = posts.concat(extra);
    }

    // 3) return a flat array of post objects
    ctx.body = posts.map(post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      original_url: post.original_url,
      published: post.published,
      clickCount: post.clickCount,
    }));
  },
};