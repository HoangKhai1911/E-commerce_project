// src/scripts/crawlAndSeed.ts

import { Strapi } from '@strapi/strapi';
import Parser, { Item } from 'rss-parser';
import { slugify } from '../src/utils/slugtify';
import { fetchWithRetry } from '../src/utils/rssFetcher';
import axios from 'axios';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { URL } from 'url';
import { createWriteStream } from 'fs';

const extractImageUrl = (item: Item): string | null => {
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url;
  }
  const content = item['content:encoded'] || item.content || item.summary || '';
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1] ?? null;
};

const uploadImageAndGetId = async (imageUrl: string | null, strapi: Strapi): Promise<number | null> => {
  if (!imageUrl) {
    console.log('⚠️ Không tìm thấy URL ảnh.');
    return null;
  }
  console.log(`🖼️ Đang xử lý ảnh từ URL: ${imageUrl}`);
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'strapi-crawl-'));
  let urlObject: URL;
  try {
    urlObject = new URL(imageUrl);
  } catch (error: any) {
    console.error(`❌ Lỗi URL ảnh: ${imageUrl}`, error.message);
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(err => console.error(`Failed to remove temp dir ${tmpDir}`, err));
    return null;
  }
  const rawFileName = path.basename(urlObject.pathname);
  const fileName = rawFileName.split('?')[0].replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const tmpPath = path.join(tmpDir, fileName || 'default-image.jpg');

  try {
    const response = await axios({ method: 'get', url: imageUrl, responseType: 'stream', timeout: 15000 });
    const writer = createWriteStream(tmpPath);
    response.data.pipe(writer);
    await new Promise<void>((resolve, reject) => { writer.on('finish', resolve); writer.on('error', reject); });
    const stats = await fs.stat(tmpPath);
    console.log(`✅ Đã tải ảnh xuống: ${tmpPath} (${stats.size} bytes)`);
    const [uploadedImage] = await strapi.plugins.upload.services.upload.upload({
      data: {},
      files: { path: tmpPath, name: fileName, type: response.headers['content-type'] || 'application/octet-stream', size: stats.size },
    });
    console.log(`👍 Đã tải ảnh lên Strapi thành công với ID: ${uploadedImage.id}`);
    return uploadedImage.id;
  } catch (error: any) {
    console.error(`❌ Lỗi khi tải ảnh từ ${imageUrl}:`, error.message);
    return null;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(err => console.error(`Failed to remove temp dir ${tmpDir}`, err));
  }
};

const tryUploadImageWithRetry = async (
  imageUrl: string | null,
  strapi: Strapi,
  maxRetries = 3
): Promise<number | null> => {
  let attempts = 0;
  while (attempts < maxRetries) {
    const imageId = await uploadImageAndGetId(imageUrl, strapi);
    if (imageId) return imageId;
    attempts++;
    console.warn(`🔁 Retry tải ảnh (${attempts}/${maxRetries})...`);
  }
  return null;
};

export const crawlAndSeed = async (strapi: Strapi) => {
  const MAX_POSTS_PER_SOURCE = 100;
  console.log('--- 📰 Đang crawl RSS feeds & seed bài viết ---');

  const parser = new Parser();
  const sources = await strapi.db.query('api::source.source').findMany({ where: { isActive: true } });

  for (const src of sources) {
    console.log(`🔍 Đang lấy feed từ ${src.name}...`);
    let xml: string;
    try {
      xml = await fetchWithRetry(src.URL);
    } catch (err: any) {
      console.error(`❌ [${src.name}] Lỗi khi lấy feed:`, err.message);
      continue;
    }

    const feed = await parser.parseString(xml);
    const itemsToSeed = feed.items.slice(0, MAX_POSTS_PER_SOURCE);

    if (itemsToSeed.length === 0) {
      console.log(`⏭️ Không có bài viết nào để xử lý cho ${src.name}`);
      continue;
    }

    for (const item of itemsToSeed) {
      const title = item.title || 'Không có tiêu đề';
      const url = item.link || '';

      const existingPost = await strapi.db.query('api::post.post').findOne({
        where: { original_url: url },
        populate: ['image'],
      });

      if (existingPost) {
        if (!existingPost.image || existingPost.image.length === 0) {
          console.log(`\n--- Bắt đầu xử lý ảnh cho bài viết cũ: "${title}" ---`);
          const imageUrl = extractImageUrl(item);
          const imageId = await tryUploadImageWithRetry(imageUrl, strapi);

          if (imageId) {
            try {
              await strapi.db.query('api::post.post').update({
                where: { id: existingPost.id },
                data: { image: [imageId] },
              });
              console.log(`✅ Đã cập nhật ảnh với ID: ${imageId} cho bài viết "${title}"`);
            } catch (err: any) {
              console.error(`❌ Lỗi khi cập nhật ảnh cho bài viết "${title}":`, err.message);
            }
          } else {
            console.log(`⚠️ Bỏ qua cập nhật: không tải ảnh được cho bài viết "${title}"`);
          }
        } else {
          console.log(`⏭️ Bài viết "${title}" đã tồn tại và có ảnh. Bỏ qua.`);
        }
      } else {
        console.log(`🆕 Tạo mới bài viết: "${title}"`);
        const imageUrl = extractImageUrl(item);
        const imageId = await tryUploadImageWithRetry(imageUrl, strapi);

        try {
          const newPost = await strapi.db.query('api::post.post').create({
            data: {
              title,
              slug: slugify(title),
              content: item['content:encoded'] || item.content || '',
              original_url: url,
              image: imageId ? [imageId] : [],
              publishedAt: item.isoDate || new Date().toISOString(),
            },
          });
          console.log(`✅ Đã tạo bài viết mới: "${title}"`);

          if (!imageId) {
            console.warn(`⚠️ Ảnh không tải được sau nhiều lần thử – xoá bài viết "${title}"`);
            await strapi.db.query('api::post.post').delete({ where: { id: newPost.id } });
          }
        } catch (err: any) {
          console.error(`❌ Lỗi khi tạo bài viết mới "${title}":`, err.message);
        }
      }
    }
  }

  console.log('--- Crawl & seed hoàn tất ---');
};
