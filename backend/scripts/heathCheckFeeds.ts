import axios from 'axios';
import { Strapi } from '@strapi/strapi';

export const healthCheckFeeds = async (strapi: Strapi) => {
  const sources = await strapi.db
    .query('api::source.source')
    .findMany({ select: ['id', 'name', 'URL', 'errorCount'] });
  for (const src of sources) {
    try {
      await axios.head(src.URL, { timeout: 5000 });
      if (src.errorCount > 0) {
        // Reset errorCount nếu đang up
        await strapi.db.query('api::source.source').update({
          where: { id: src.id },
          data: { errorCount: 0, isActive: true },
        });
      }
      console.log(`✅ Healthy: ${src.name}`);
    } catch (err: any) {
      console.warn(`⚠️ Unhealthy: ${src.name} – ${err.code || err.message}`);
    }
  }
  console.log('--- Feed health-check complete ---');
};