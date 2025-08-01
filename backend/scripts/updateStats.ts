// scripts/updateStats.ts

import { Strapi } from '@strapi/strapi';

// Hàm bây giờ nhận đối tượng 'strapi' làm tham số
export const updateCategoryStats = async (strapi: Strapi) => {
  try {
    console.log('Bắt đầu cập nhật thống kê...');
    const today = new Date();

    // Tác vụ 1: Đặt lại clickCount của bài viết về 1 sau 24h
    const postsToUpdate = await strapi.db.query('api::post.post').findMany({
      where: {
        publishedAt: {
          $lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Tìm bài viết cũ hơn 24 giờ
        },
      },
    });

    if (postsToUpdate.length > 0) {
      for (const post of postsToUpdate) {
        await strapi.db.query('api::post.post').update({
          where: { id: post.id },
          data: { clickCount: 1 },
        });
      }
      console.log(`✅ Đã đặt lại clickCount cho ${postsToUpdate.length} bài viết.`);
    }

    // Tác vụ 2: Tính point cho Category
    const categories = await strapi.db.query('api::category.category').findMany({
      populate: ['posts'],
    });

    for (const category of categories) {
      const totalClicks = category.posts.reduce((sum: number, post: any) => sum + post.clickCount, 0);

      const existingStat = await strapi.db.query('api::category-stat.category-stat').findOne({
        where: { category: category.id, date: today },
      });

      if (existingStat) {
        await strapi.db.query('api::category-stat.category-stat').update({
          where: { id: existingStat.id },
          data: { point: totalClicks, clickCount: totalClicks },
        });
      } else {
        await strapi.db.query('api::category-stat.category-stat').create({
          data: {
            category: category.id,
            date: today,
            point: totalClicks,
            clickCount: totalClicks,
          },
        });
      }
      console.log(`✅ Cập nhật point cho category "${category.name}" thành ${totalClicks}.`);
    }

    console.log('🎉 Cập nhật thống kê hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật thống kê:', error);
  }
};
