// src/composables/usePosts.ts
import api from '@/lib/api'; // Sử dụng instance đã được cấu hình với interceptor
import { useAuthStore } from '@/store/auth';

// Định nghĩa các kiểu dữ liệu để code rõ ràng hơn
interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Author {
  id: number;
  username: string;
  avatar?: { url: string };
}

interface Source {
  id: number;
  name: string;
  url?: string; // url có thể không có nếu chỉ có original_url
}

interface Post {
  id: number;
  title: string;
  slug: string;
  content?: string;
  publishedAt: string;
  clickCount?: number;
  categories?: Array<{ id: number; name: string; slug: string }>;
  source?: { id: number; name: string; url?: string };
  image?: {
    url: string;
  }[];
  author?: Author;
  excerpt?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export function usePosts() {
  const authStore = useAuthStore();

  /**
   * Lấy bài viết đề xuất (cá nhân hóa hoặc công khai)
   */
  const fetchRecommendedPosts = async (): Promise<Post[]> => {
    const endpoint = authStore.isAuthenticated
      ? '/recommendations/authenticated'
      : '/recommendations/unauthenticated';
    try {
      const response = await api.get<Post[]>(endpoint);
      return response.data;
    } catch (err: any) {
      console.error(`Error fetching recommended posts from ${endpoint}:`, err);
      throw err; // Ném lỗi ra để Promise.all có thể bắt được
    }
  };

  /**
   * Lấy các bài viết mới nhất (có phân trang)
   */
  const fetchLatestPosts = async (page = 1, pageSize = 6): Promise<PaginatedResponse<Post>> => {
    try {
      // Tận dụng endpoint search, khi không có query `q` nó sẽ trả về bài viết mới nhất
      const response = await api.get<PaginatedResponse<Post>>('/recommendations/search', {
        params: { 'pagination[page]': page, 'pagination[pageSize]': pageSize },
      });
      return response.data;
    } catch (err: any) {
      console.error('Error fetching latest posts:', err);
      throw err;
    }
  };

  /**
   * Lấy một bài viết bằng slug từ backend.
   * Sửa URL để khớp với route backend: /api/posts/:slug
   * Sử dụng `api.get` để tận dụng cấu hình axios.
   */
  const getPostBySlug = async (slug: string): Promise<Post> => {
    try {
      const response = await api.get(`/posts/${slug}`, {
        params: {
          populate: {
            image: { fields: ['url', 'alternativeText'] },
            author: {
              fields: ['username'],
              populate: {
                avatar: { fields: ['url'] },
              },
            },
            categories: { fields: ['name', 'slug'] },
            source: { fields: ['name', 'url'] },
          }
        },
      });

      const raw = response.data.data;

      // THAY ĐỔI QUAN TRỌNG: Ánh xạ dữ liệu từ raw.attributes vào đối tượng Post
      const post: Post = {
        id: raw.id,
        title: raw.attributes.title,
        slug: raw.attributes.slug,
        content: raw.attributes.content,
        excerpt: raw.attributes.excerpt,
        publishedAt: raw.attributes.publishedAt,
        clickCount: raw.attributes.clickCount,
        // Ánh xạ image
        image: raw.attributes.image?.data?.map((img: any) => img.attributes) || [],
        // Ánh xạ author
        author: raw.attributes.author?.data?.attributes ? {
          id: raw.attributes.author.data.id as number,
          username: raw.attributes.author.data.attributes.username as string,
          avatar: raw.attributes.author.data.attributes.avatar?.data?.attributes ? { url: raw.attributes.author.data.attributes.avatar.data.attributes.url as string } : undefined,
        } : undefined,
        // Ánh xạ categories
        categories: raw.attributes.categories?.data ? raw.attributes.categories.data.map((cat: any) => ({
          id: cat.id as number,
          name: cat.attributes.name as string,
          slug: cat.attributes.slug as string,
        })) : [],
        // Ánh xạ source: Sử dụng original_url từ attributes nếu source không có url
        source: raw.attributes.source?.data?.attributes ? {
          id: raw.attributes.source.data.id as number,
          name: raw.attributes.source.data.attributes.name as string,
          url: (raw.attributes.source.data.attributes.url || raw.attributes.original_url) as string,
        } : (raw.attributes.original_url ? { id: -1, name: 'Nguồn gốc', url: raw.attributes.original_url as string } : undefined),
      };

      return post;
    } catch (err: any) {
      console.error('Error fetching post by slug:', err);
      throw err;
    }
  };

  /**
   * 🔴 THÊM MỚI: Lấy các bài viết theo danh mục (slug), có phân trang và sắp xếp.
   * Hàm này sẽ được gọi từ CategoryDetailPage.vue
   */
  const getPostsByCategory = async (
    categorySlug: string,
    page: number,
    pageSize: number,
    sort: string,
    sourceId: number | ''
  ): Promise<PaginatedResponse<Post>> => {
    const params: any = {
      'populate': ['categories', 'source', 'image', 'author.avatar'], // Populate các quan hệ cần thiết
      'filters[categories][slug][$eq]': categorySlug, // Lọc theo slug của danh mục
      'pagination[page]': page,
      'pagination[pageSize]': pageSize,
      'sort': sort,
    };

    if (sourceId) {
      params['filters[source][id][$eq]'] = sourceId; // Thêm bộ lọc theo nguồn nếu có
    }

    try {
      const response = await api.get('/posts', { params });
      // Strapi trả về PaginatedResponse với data nằm trong .data và meta trong .meta
      // Cần ánh xạ lại data để phù hợp với interface Post
      const transformedData = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.attributes.title,
        slug: item.attributes.slug,
        content: item.attributes.content,
        excerpt: item.attributes.excerpt,
        publishedAt: item.attributes.publishedAt,
        clickCount: item.attributes.clickCount,
        image: item.attributes.image?.data?.map((img: any) => img.attributes) || [],
        author: item.attributes.author?.data?.attributes ? {
          id: item.attributes.author.data.id,
          username: item.attributes.author.data.attributes.username,
          avatar: item.attributes.author.data.attributes.avatar?.data?.attributes ? { url: item.attributes.author.data.attributes.avatar.data.attributes.url } : undefined,
        } : undefined,
        categories: item.attributes.categories?.data ? item.attributes.categories.data.map((cat: any) => ({
          id: cat.id,
          name: cat.attributes.name,
          slug: cat.attributes.slug,
        })) : [],
        source: item.attributes.source?.data?.attributes ? {
          id: item.attributes.source.data.id,
          name: item.attributes.source.data.attributes.name,
          url: item.attributes.source.data.attributes.url,
        } : undefined,
      }));

      return {
        data: transformedData,
        meta: response.data.meta,
      };

    } catch (err: any) {
      console.error('Error fetching posts by category:', err);
      throw err;
    }
  };


  /**
   * Lấy các bài viết liên quan dựa trên ID của bài viết hiện tại.
   * (Giữ nguyên như đã có trong recommendation controller)
   */
  const getRelatedPosts = async (postId: number): Promise<Post[]> => {
    try {
      const response = await api.get<Post[]>(`/recommendations/related/${postId}`, {
        params: {
          populate: {
            image: { fields: ['url', 'alternativeText'] },
            author: {
              fields: ['username'],
              populate: {
                avatar: { fields: ['url'] },
              },
            },
            categories: { fields: ['name', 'slug'] },
            source: { fields: ['name', 'url'] },
          }
        }
      });
      // Dữ liệu từ recommendation controller thường đã được ánh xạ,
      // nhưng nếu không, bạn cần thêm logic ánh xạ tương tự như getPostsByCategory
      return response.data;
    } catch (err: any) {
      console.error('Error fetching related posts:', err);
      throw err;
    }
  };

  return {
    fetchRecommendedPosts,
    fetchLatestPosts,
    getPostBySlug,
    getRelatedPosts,
    getPostsByCategory, // 🔴 EXPORT HÀM MỚI
  };
}
