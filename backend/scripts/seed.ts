// scripts/seed.ts
// Hoặc khuyến nghị đặt tại: src/seed/seed-data.ts để tổ chức project tốt hơn

// Định nghĩa các Interface cho dữ liệu seed
interface CategorySeed {
  name: string;
  slug: string;
  description?: string; // Tùy chọn: nếu bạn có trường này trong schema Category
}

interface SourceSeed {
  name: string;
  URL: string; // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL' ĐỂ KHỚP VỚI SCHEMA CỦA BẠN
  homepage_url?: string; // Tùy chọn: nếu bạn có trường này
  logo?: string;        // Tùy chọn: nếu bạn có trường này
  description?: string; // Tùy chọn: nếu bạn có trường này
  category_slugs: string[]; // Một nguồn có thể thuộc nhiều danh mục
}

// Dữ liệu mẫu cho Categories
const categoriesData: CategorySeed[] = [
  { name: 'Công nghệ', slug: 'cong-nghe' },
  { name: 'Thể thao', slug: 'the-thao' },
  { name: 'Kinh doanh', slug: 'kinh-doanh' },
  { name: 'Sức khỏe', slug: 'suc-khoe' },
  { name: 'Giải trí', slug: 'giai-tri' },
  { name: 'Giáo dục', slug: 'giao-duc' },
  { name: 'Du lịch', slug: 'du-lich' },
  { name: 'Ô tô - Xe máy', slug: 'o-to-xe-may' },
  { name: 'Khoa học', slug: 'khoa-hoc' },
  { name: 'Thời sự', slug: 'thoi-su' },
];

// Dữ liệu mẫu cho Sources
const sourcesData: SourceSeed[] = [
  {
    name: 'VNExpress Công Nghệ',
    URL: 'https://vnexpress.net/rss/so-hoa.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['cong-nghe'],
  },
  {
    name: 'VNExpress Thể Thao',
    URL: 'https://vnexpress.net/rss/the-thao.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['the-thao'],
  },
  {
    name: 'CafeF Kinh Doanh',
    URL: 'https://cafef.vn/trang-chu.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['kinh-doanh'],
  },
  {
    name: 'VNExpress Sức Khỏe',
    URL: 'https://vnexpress.net/rss/suc-khoe.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['suc-khoe'],
  },
  {
    name: 'Zing Giải Trí',
    URL: 'https://zingnews.vn/rss/giai-tri.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['giai-tri'],
  },
  {
    name: 'VNExpress Giáo Dục',
    URL: 'https://vnexpress.net/rss/giao-duc.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['giao-duc'],
  },
  {
    name: 'VNExpress Du Lịch',
    URL: 'https://vnexpress.net/rss/du-lich.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['du-lich'],
  },
  {
    name: 'VNExpress Xe',
    URL: 'https://vnexpress.net/rss/oto-xe-may.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['o-to-xe-may'],
  },
  {
    name: 'VNExpress Khoa Học',
    URL: 'https://vnexpress.net/rss/khoa-hoc.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['khoa-hoc'],
  },
  {
    name: 'VNExpress Thời Sự',
    URL: 'https://vnexpress.net/rss/thoi-su.rss', // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
    category_slugs: ['thoi-su'],
  },
  // Thêm các nguồn khác nếu cần
];

// Hàm chính để thực hiện seed dữ liệu
export default async ({ strapi }: { strapi: any }) => {
  console.log('🚀 Starting seed data...');

  // Bước 1: Seed Categories
  // Sử dụng một đối tượng để lưu trữ slug -> ID của các category đã tạo/tồn tại
  // Điều này cần thiết cho việc gán mối quan hệ cho Sources sau này
  const createdCategories: Record<string, number> = {};

  console.log('\n--- Seeding Categories ---');
  for (const cat of categoriesData) {
    try {
      const exists = await strapi.db.query('api::category.category').findOne({
        where: { slug: cat.slug },
      });

      if (!exists) {
        const newCategory = await strapi.db.query('api::category.category').create({
          data: {
            ...cat,
            // Đảm bảo publishedAt được gán nếu draftAndPublish được bật
            publishedAt: new Date().toISOString(),
          },
        });
        createdCategories[cat.slug] = newCategory.id;
        console.log(`✅ Category seeded: ${cat.name} (ID: ${newCategory.id})`);
      } else {
        createdCategories[cat.slug] = exists.id;
        console.log(`ℹ️ Category exists: ${cat.name} (ID: ${exists.id})`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed category ${cat.name}:`, error);
    }
  }

  // Bước 2: Seed Sources
  console.log('\n--- Seeding Sources ---');
  for (const src of sourcesData) {
    try {
      // Lấy ID của các Category liên quan dựa trên category_slugs
      const categoryIds: number[] = [];
      for (const slug of src.category_slugs) {
        if (createdCategories[slug]) {
          categoryIds.push(createdCategories[slug]);
        } else {
          console.warn(`⚠️ Category slug not found for source "${src.name}": "${slug}". Please ensure category exists.`);
        }
      }

      if (src.category_slugs.length > 0 && categoryIds.length === 0) {
        console.warn(`⚠️ No valid categories found for source: ${src.name}. Skipping this source.`);
        continue; // Bỏ qua nguồn này nếu không tìm thấy danh mục liên quan
      }

      const exists = await strapi.db.query('api::source.source').findOne({
        where: { URL: src.URL }, // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
      });

      if (!exists) {
        const newSource = await strapi.db.query('api::source.source').create({
          data: {
            name: src.name,
            URL: src.URL, // ĐÃ THAY ĐỔI TỪ 'rss_url' THÀNH 'URL'
            homepage_url: src.homepage_url,
            logo: src.logo,
            description: src.description,
            // Gán mối quan hệ manyToMany bằng cách truyền một mảng các IDs
            categories: categoryIds,
            // Đảm bảo publishedAt được gán nếu draftAndPublish được bật
            publishedAt: new Date().toISOString(),
          },
        });
        console.log(`✅ Source seeded: ${src.name} (ID: ${newSource.id})`);
      } else {
        console.log(`ℹ️ Source exists: ${src.name} (ID: ${exists.id})`);
        // Tùy chọn: Nếu nguồn đã tồn tại, bạn có thể cân nhắc cập nhật mối quan hệ category nếu cần
        // Ví dụ:
        // await strapi.db.query('api::source.source').update({
        //   where: { id: exists.id },
        //   data: { categories: categoryIds },
        // });
        // console.log(`🔄 Source updated: ${src.name} (ID: ${exists.id}) with new categories.`);
      }
    } catch (error) {
      console.error(`❌ Failed to seed source ${src.name}:`, error);
    }
  }

  console.log('\n✅ Seeding completed!');
};