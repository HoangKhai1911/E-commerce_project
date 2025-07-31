// src/index.ts hoặc src/bootstrap.ts (tùy cấu trúc dự án)
import { Strapi } from '@strapi/strapi';
import { seedData } from '../scripts/seed';
import { crawlAndSeed } from '../scripts/crawlAndSeed';

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
  },
};