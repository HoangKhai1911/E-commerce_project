<template>
  <router-link
    :to="{ name: 'CategoryDetail', params: { slug: category.slug } }"
    class="card category-card text-center d-block text-decoration-none text-dark h-100 shadow-sm"
  >
    <div class="card-body d-flex flex-column justify-content-center align-items-center">
      <i :class="iconClass" class="display-5 mb-2 text-primary"></i>
      <h5 class="card-title fw-bold mb-0">{{ category.name }}</h5>
      <p v-if="category.point" class="card-text text-muted mt-1">
        <small>{{ category.point }} lượt xem</small>
      </p>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';

interface Category {
  id: number;
  name: string;
  slug: string;
  point?: number;
}

const props = defineProps<{
  category: Category;
}>();

// Ánh xạ tên chủ đề với class của Bootstrap Icons
const categoryIcons = {
  'Công nghệ': 'bi-robot',
  'Du lịch': 'bi-airplane',
  'Giáo dục': 'bi-book',
  'Giải trí': 'bi-film',
  'Khoa học': 'bi-flask',
  'Kinh doanh': 'bi-briefcase',
  'Sức khỏe': 'bi-heart-pulse',
  'Thể thao': 'bi-trophy',
  'Thời sự': 'bi-newspaper',
  'Ô tô - Xe máy': 'bi-car-front',
  'Phần mềm': 'bi-code-slash',
  // 'Đồ họa': 'bi-brush',
  // 'Marketing': 'bi-graph-up',
  // 'Lập trình': 'bi-laptop',
  // 'Sản phẩm': 'bi-boxes',
  // 'Đời sống': 'bi-heart',
  // 'Sách': 'bi-book',
  // Thêm các chủ đề khác nếu cần
};

// Sử dụng computed property để lấy icon class động
const iconClass = computed(() => {
  // Trả về icon tương ứng, nếu không có thì dùng icon mặc định
  return `bi ${categoryIcons[props.category.name] || 'bi-tag-fill'}`;
});
</script>