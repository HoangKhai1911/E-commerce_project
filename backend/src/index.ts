// src/index.ts

import { Strapi } from '@strapi/strapi';
import cron from 'node-cron';
import { seedData } from '../scripts/seed';
import { crawlAndSeed } from '../scripts/crawlAndSeed';
import { updateCategoryStats } from '../scripts/updateStats';

export default {
  async bootstrap({ strapi }: { strapi: Strapi }) {
    const env = strapi.config.environment;

    if (env === 'development') {
      console.log('🌱 1. Seeding Categories & Sources...');
      await seedData(strapi);

      console.log('🌐 2. Crawling RSS & Seeding Posts...');
      await crawlAndSeed(strapi);

      console.log('🎉 Bootstrap seeding & crawling completed!');
    }

    // Đặt một khoảng thời gian chờ ngắn trước khi chạy cron job
    // Điều này giúp đảm bảo cơ sở dữ liệu đã được kết nối đầy đủ.
    setTimeout(() => {
      // Đặt cron job tại đây, trong hàm bootstrap
      // Hàm này sẽ chạy định kỳ và truyền đối tượng 'strapi' vào
      
      // Cron job 1: Cập nhật thống kê category lúc 3 giờ sáng mỗi ngày.
      cron.schedule('0 3 * * *', async () => {
        console.log('📈 Running daily category stats update...');
        await updateCategoryStats(strapi);
      });

      // Cron job 2: Crawl và seed bài viết mỗi 24 giờ (mỗi ngày một lần).
      // Bạn có thể thay đổi thời gian này nếu muốn.
      // Ví dụ: '0 */24 * * *' hoặc '0 0 * * *'
      cron.schedule('0 0 * * *', async () => {
        console.log('🌐 Running daily RSS crawl and seed...');
        await crawlAndSeed(strapi);
      });
      
    }, 5000); // Đợi 5 giây trước khi thiết lập cron job

  },

  register({ strapi }: { strapi: Strapi }) {
    // Không làm gì ở đây
  },
};
