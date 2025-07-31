// src/scripts/seed.ts

import { Strapi } from '@strapi/strapi';
import { slugify } from '../src/utils/slugtify';

const categories = [
  { name: 'Công nghệ', slug: 'cong-nghe' },
  { name: 'Thể thao',  slug: 'the-thao' },
  { name: 'Kinh doanh', slug: 'kinh-doanh' },
  { name: 'Sức khỏe',   slug: 'suc-khoe' },
  { name: 'Giải trí',   slug: 'giai-tri' },
  { name: 'Giáo dục',   slug: 'giao-duc' },
  { name: 'Du lịch',    slug: 'du-lich' },
  { name: 'Ô tô - Xe máy', slug: 'o-to-xe-may' },
  { name: 'Khoa học',   slug: 'khoa-hoc' },
  { name: 'Thời sự',    slug: 'thoi-su' },
];

const sources = [
  { name: 'VNExpress Công Nghệ', URL: 'https://vnexpress.net/rss/so-hoa.rss' },
  { name: 'VNExpress Thể Thao',  URL: 'https://vnexpress.net/rss/the-thao.rss' },
  { name: 'CafeF Kinh Doanh',    URL: 'https://cafef.vn/rss/304/kinh-doanh.rss' },
  { name: 'VNExpress Sức Khỏe',  URL: 'https://vnexpress.net/rss/suc-khoe.rss' },
  { name: 'Zing Giải Trí',      URL: 'https://zingnews.vn/rss/giai-tri.rss' },
  { name: 'VNExpress Giáo Dục', URL: 'https://vnexpress.net/rss/giao-duc.rss' },
  { name: 'VNExpress Du Lịch',  URL: 'https://vnexpress.net/rss/du-lich.rss' },
  { name: 'VNExpress Xe',        URL: 'https://vnexpress.net/rss/oto-xe-may.rss' },
  { name: 'VNExpress Khoa Học',  URL: 'https://vnexpress.net/rss/khoa-hoc.rss' },
  { name: 'VNExpress Thời Sự',   URL: 'https://vnexpress.net/rss/thoi-su.rss' },
];

export const seedData = async (strapi: Strapi) => {
  console.log('--- 🪴 Seeding Categories ---');
  for (const cat of categories) {
    const exists = await strapi.db
      .query('api::category.category')
      .findOne({ where: { slug: cat.slug } });

    if (!exists) {
      await strapi.db.query('api::category.category').create({ data: cat });
      console.log(`✅ Created category: ${cat.name}`);
    } else {
      console.log(`⏭️ Category exists: ${cat.name}`);
    }
  }

  console.log('\n--- 🔗 Seeding Sources ---');
  for (const src of sources) {
    const slug = slugify(src.name);

    // 1. Tìm theo URL
    let record = await strapi.db
      .query('api::source.source')
      .findOne({ where: { URL: src.URL } });

    if (record) {
      console.log(`⏭️ Source exists (by URL): ${src.name}`);
      // Nếu slug cũ khác slug mới, thì update slug
      if (record.slug !== slug) {
        await strapi.db.query('api::source.source').update({
          where: { id: record.id },
          data: { slug },
        });
        console.log(`🔄 Updated slug for ${src.name} → ${slug}`);
      }
      continue;
    }

    // 2. Nếu không tìm theo URL, tìm theo slug
    record = await strapi.db
      .query('api::source.source')
      .findOne({ where: { slug } });

    if (record) {
      // Update URL nếu slug trùng nhưng URL khác
      await strapi.db.query('api::source.source').update({
        where: { id: record.id },
        data: { URL: src.URL, name: src.name },
      });
      console.log(`🔄 Updated URL for existing slug ${slug}: ${src.URL}`);
      continue;
    }

    // 3. Nếu không tìm được record nào, tạo mới
    await strapi.db.query('api::source.source').create({
      data: { name: src.name, URL: src.URL, slug },
    });
    console.log(`✅ Created source: ${src.name}`);
  }

  console.log('\n🎉 Seeding completed!');
};