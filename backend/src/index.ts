import { Strapi } from '@strapi/strapi';
import cron from 'node-cron';
import { seedData } from '../scripts/seed';
import { crawlAndSeed } from '../scripts/crawlAndSeed';
import { updateCategoryStats } from '../scripts/updateStats';

export default {
  async bootstrap({ strapi }: { strapi: Strapi }) {
    const env = strapi.config.environment;

    // ✅ Tạo Super Admin nếu chưa có
    console.log('👤 Checking for Super Admin...');

    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@example.com';
    const adminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'abc123';

    const superAdminRole = await strapi.query('admin::role').findOne({
      where: { code: 'strapi-super-admin' },
    });

    const existingAdmin = await strapi.query('admin::user').findOne({
      where: { email: adminEmail },
    });

    if (!existingAdmin) {
      await strapi.query('admin::user').create({
        data: {
          username: adminUsername,
          email: adminEmail,
          password: adminPassword,
          roles: [superAdminRole.id],
          blocked: false,
          isActive: true,
        },
      });
      console.log(`✅ Super Admin created: ${adminEmail}`);
    } else {
      console.log(`ℹ Super Admin already exists: ${adminEmail}`);
    }

    // ✅ Sau đó mới seeding nếu ở dev
    if (env === 'development') {
      console.log('🌱 1. Seeding Categories & Sources...');
      await seedData(strapi);

      console.log('🌐 2. Crawling RSS & Seeding Posts...');
      await crawlAndSeed(strapi);

      console.log('🎉 Bootstrap seeding & crawling completed!');
    }

    // ✅ Cron job
    setTimeout(() => {
      cron.schedule('0 3 * * *', async () => {
        console.log('📈 Running daily category stats update...');
        await updateCategoryStats(strapi);
      });

      cron.schedule('0 0 * * *', async () => {
        console.log('🌐 Running daily RSS crawl and seed...');
        await crawlAndSeed(strapi);
      });
    }, 5000);
  },

  register({ strapi }: { strapi: Strapi }) {
    // không làm gì
  },
};
