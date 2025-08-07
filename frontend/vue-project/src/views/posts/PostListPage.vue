<template>
  <div class="container py-5">
    <h1 class="mb-4">Danh sách bài viết</h1>

    <!-- Loading State -->
    <div v-if="isLoading" class="row g-4">
      <div v-for="n in 6" :key="n" class="col-12 col-md-6 col-lg-4">
        <PostCardSkeleton />
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="flattenedPosts.length > 0">
      <div class="row g-4">
        <div
          v-for="post in flattenedPosts"
          :key="post.id"
          class="col-12 col-md-6 col-lg-4 d-flex align-items-stretch"
        >
          <!-- Truyền đối tượng bài viết đã được làm phẳng vào component PostCard -->
          <PostCard :post="post" class="w-100" />
        </div>
      </div>

      <!-- Pagination Controls -->
      <BasePagination
        v-if="posts.meta && posts.meta.pagination && posts.meta.pagination.pageCount > 1"
        v-model="currentPage"
        :meta="posts.meta.pagination"
        class="mt-5 d-flex justify-content-center"
      />
    </div>

    <!-- No posts -->
    <div v-else class="text-center text-muted mt-5">
      <p>Chưa có bài viết nào.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import api from '@/lib/api';
import BasePagination from '@/components/ui/BasePagination.vue';
import PostCard from '@/components/posts/PostCard.vue';
import PostCardSkeleton from '@/components/posts/PostCardSkeleton.vue';

// 1. Tạo một Ref để theo dõi trang hiện tại
const currentPage = ref(1);

// 2. Định nghĩa hàm gọi API, nhận `page` làm tham số và populate thêm dữ liệu
// Luôn đảm bảo populate đầy đủ các trường cần thiết, đặc biệt là `thumbnail`.
const fetchPosts = (page: number) => {
  return api.get('/posts', {
    params: {
      'pagination[page]': page,
      'pagination[pageSize]': 6, // Hiển thị 6 bài viết mỗi trang
      'sort': 'publishedAt:desc',
      'populate[image]': '*', // Thay 'thumbnail' bằng 'image'
      'populate[author][populate][avatar]': '*',
      'populate[categories]': '*'
    }
  });
};

// 3. Sử dụng `useApi` và truyền `currentPage` vào `watchSources`
const { 
  data: posts, 
  isLoading, 
  error 
} = useApi(fetchPosts, {
  // Cung cấp dữ liệu ban đầu để tránh lỗi template
  initialData: {
    data: [],
    meta: {
      pagination: { page: 1, pageSize: 6, pageCount: 1, total: 0 }
    }
  },
  // `useApi` sẽ tự động gọi lại `fetchPosts` mỗi khi `currentPage` thay đổi
  watchSources: currentPage
});

// 4. Tạo một computed property để "làm phẳng" dữ liệu từ Strapi
// Logic làm phẳng đã được viết lại để đơn giản và trực tiếp hơn, chỉ trích xuất những thuộc tính cần thiết.
const flattenedPosts = computed(() => {
  if (!posts.value || !posts.value.data) {
    return [];
  }
  return posts.value.data.map((post: any) => {
    // Trích xuất mảng ảnh từ trường 'image'. Vì 'image' là trường multiple media, nó sẽ là một mảng.
    const imageData = post.attributes.image?.data?.map((img: any) => img.attributes) || [];

    // Trích xuất dữ liệu tác giả
    const authorData = post.attributes.author?.data?.attributes;
    const authorAvatar = post.attributes.author?.data?.attributes?.avatar?.data?.attributes;
    const flattenedAuthor = authorData ? { ...authorData, avatar: authorAvatar } : null;

    // Trích xuất dữ liệu categories
    const flattenedCategories = post.attributes.categories?.data?.map((c: any) => ({
      id: c.id,
      ...c.attributes
    })) || [];

    // Tạo một đối tượng bài viết mới với các trường đã được làm phẳng
    return {
      id: post.id,
      slug: post.attributes.slug,
      title: post.attributes.title,
      excerpt: post.attributes.excerpt,
      publishedAt: post.attributes.publishedAt,
      // Gán mảng ảnh đã được xử lý. PostCard sẽ tự động lấy ảnh đầu tiên.
      image: imageData,
      author: flattenedAuthor,
      categories: flattenedCategories,
    };
  });
});
</script>
