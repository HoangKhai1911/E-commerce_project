// src/scripts/crawlAndSeed.ts

import { Strapi } from '@strapi/strapi';
import Parser from 'rss-parser';
import { slugify } from '../src/utils/slugtify';
import { fetchWithRetry } from '../src/utils/rssFetcher';

export const crawlAndSeed = async (strapi: Strapi) => {
  const MAX_POSTS_PER_SOURCE = 100;
  console.log('--- 📰 Crawling RSS feeds & seeding Posts ---');

  const parser = new Parser();
  const sources = await strapi.db
    .query('api::source.source')
    .findMany({ where: { isActive: true } });
  const categories = await strapi.db
    .query('api::category.category')
    .findMany({ select: ['id'] });

  for (const src of sources) {
    console.log(`🔍 Fetching feed from ${src.name}...`);
    let xml: string;
    try {
      xml = await fetchWithRetry(src.URL);
    } catch (err: any) {
      console.error(`❌ [${src.name}] fetch failed:`, err.message);
      continue;
    }

    const feed = await parser.parseString(xml);
    const lastCrawl = src.lastCrawledAt ? new Date(src.lastCrawledAt) : null;

    // Lần đầu: lấy tối đa MAX_POSTS_PER_SOURCE
    let itemsToSeed = lastCrawl === null
      ? feed.items.slice(0, MAX_POSTS_PER_SOURCE)
      : feed.items.filter(item =>
          item.isoDate ? new Date(item.isoDate) > lastCrawl : false
        );

    if (!itemsToSeed.length) {
      console.log(`⏭️ No new items for ${src.name}`);
      continue;
    }

    let maxPub = lastCrawl ?? new Date(0);
    for (const item of itemsToSeed) {
      const title   = item.title || 'No title';
      const pubDate = item.isoDate ? new Date(item.isoDate) : new Date();
      const slug    = `${slugify(title)}-${pubDate.getTime()}`;
      const url     = item.link || '';

      // Kiểm tra duplicate
      const exists = await strapi.db.query('api::post.post').findOne({
        where: {
          $or: [{ slug }, { original_url: url }],
        },
      });
      if (exists) {
        maxPub = pubDate > maxPub ? pubDate : maxPub;
        continue;
      }

      // Chọn category ngẫu nhiên
      const cat = categories[Math.floor(Math.random() * categories.length)];
      try {
        await strapi.db.query('api::post.post').create({
          data: {
            title,
            slug,
            content: item['content:encoded'] || item.content || '',
            original_url: url,
            published: pubDate,
            clickCount: 0,
            source: src.id,
            categories: [cat.id],
          },
        });
        console.log(`✅ Seeded: ${title}`);
      } catch (err: any) {
        console.error(`❌ Error seeding "${title}":`, err.message);
      }

      if (pubDate > maxPub) maxPub = pubDate;
    }

    // Update lastCrawledAt
    await strapi.db.query('api::source.source').update({
      where: { id: src.id },
      data: { lastCrawledAt: maxPub },
    });
    console.log(`🔄 Updated lastCrawledAt for ${src.name}`);
  }

  console.log('--- Crawl & seed finished ---');
};