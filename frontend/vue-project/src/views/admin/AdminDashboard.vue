<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="b">BẢNG ĐIỀU KHIỂN</h1>
    </div>

    <LoadingSpinner v-if="isLoading" />
    <BaseAlert v-else-if="error" :message="error" type="danger" />

    <div v-if="!isLoading && stats">
      <!-- Stat Cards -->
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex align-items-center">
              <i class="bi bi-file-post-fill fs-1 text-primary me-4"></i>
              <div>
                <h5 class="card-title text-muted">Tổng số bài viết</h5>
                <p class="card-text fs-2 fw-bold mb-0">{{ stats.posts }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex align-items-center">
              <i class="bi bi-people-fill fs-1 text-success me-4"></i>
              <div>
                <h5 class="card-title text-muted">Tổng số người dùng</h5>
                <p class="card-text fs-2 fw-bold mb-0">{{ stats.users }}</p>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-body d-flex align-items-center">
              <i class="bi bi-tags-fill fs-1 text-info me-4"></i>
              <div>
                <h5 class="card-title text-muted">Tổng số danh mục</h5>
                <p class="card-text fs-2 fw-bold mb-0">{{ stats.categories }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row">
        <div class="col-lg-8 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-graph-up-arrow me-2"></i>Thống kê lượt xem</h5>
            </div>
            <div class="card-body">
              <LoadingSpinner v-if="isLoadingDailyViews" />
              <BaseAlert v-else-if="dailyViewsError" :message="dailyViewsError" type="danger" />
              <div v-else-if="dailyViewsData && dailyViewsData.length > 0" style="height: 350px">
                <DailyViewsChart :chart-data="dailyViewsChartData" :chart-options="dailyViewsChartOptions" />
              </div>
              <div v-else class="text-center text-muted">
                <p>Không có dữ liệu lượt xem để hiển thị.</p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-pie-chart-fill me-2"></i>Bài viết theo danh mục</h5>
            </div>
            <div class="card-body d-flex align-items-center justify-content-center">
              <div v-if="stats && stats.topCategoriesByPostCount.length > 0" style="position: relative; height: 350px; width: 100%;">
                <CategoryPieChart :chart-data="categoryPieChartData" :chart-options="categoryPieChartOptions" />
              </div>
              <div v-else class="text-center text-muted">
                <p>Không có dữ liệu để hiển thị biểu đồ.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Lists -->
      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-graph-up me-2"></i>Bài viết xem nhiều nhất</h5>
            </div>
            <div v-if="stats.topPostsByClicks.length > 0" class="list-group list-group-flush">
              <router-link v-for="post in stats.topPostsByClicks" :key="post.id" :to="{ name: 'PostDetail', params: { slug: post.slug } }" target="_blank" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div class="text-truncate me-3">
                  <span class="d-block">{{ post.title }}</span>
                  <small class="text-muted" v-if="post.author">bởi {{ post.author.username }}</small>
                </div>
                <span class="badge bg-primary rounded-pill">{{ post.clickCount }} lượt xem</span>
              </router-link>
            </div>
            <div v-else class="card-body text-center text-muted">
              <p>Không có dữ liệu để hiển thị.</p>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card shadow-sm h-100">
            <div class="card-header">
              <h5 class="mb-0"><i class="bi bi-bar-chart-line-fill me-2"></i>Danh mục nổi bật</h5>
            </div>
            <div v-if="stats.topCategoriesByPostCount.length > 0" class="list-group list-group-flush">
              <router-link v-for="category in stats.topCategoriesByPostCount" :key="category.id" :to="{ name: 'CategoryDetail', params: { slug: category.slug } }" target="_blank" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                {{ category.name }}
                <span class="badge bg-info rounded-pill">{{ category.postCount }} bài viết</span>
              </router-link>
            </div>
            <div v-else class="card-body text-center text-muted">
              <p>Không có dữ liệu để hiển thị.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ChartData, ChartOptions } from 'chart.js';
import { useApi } from '@/composables/useApi';
import apiClient from '@/lib/api';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import DailyViewsChart from '@/components/admin/DailyViewsChart.vue';
import CategoryPieChart from '@/components/admin/CategoryPieChart.vue';

interface Author {
  username: string;
}

interface TopPost {
  id: number;
  title: string;
  slug: string;
  clickCount: number;
  author?: Author;
}

interface TopCategory {
  id: number;
  name: string;
  slug: string;
  postCount: number;
}

interface DashboardStats {
  posts: number;
  users: number;
  categories: number;
  topPostsByClicks: TopPost[];
  topCategoriesByPostCount: TopCategory[];
}

interface DailyView {
  date: string; // 'YYYY-MM-DD'
  views: string; // The count might come back as a string from a raw query
}

const { 
  data: stats, 
  isLoading, 
  error, 
} = useApi<DashboardStats>((options) => apiClient.get('/view-log/stats', options), {
  initialData: { 
    posts: 0, 
    users: 0, 
    categories: 0,
    topPostsByClicks: [],
    topCategoriesByPostCount: [],
  },
});

const { 
  data: dailyViewsData, 
  isLoading: isLoadingDailyViews, 
  error: dailyViewsError 
} = useApi<DailyView[]>(
  (options) => apiClient.get('/view-log/daily-views', options),
  { initialData: [] }
);

const dailyViewsChartData = computed<ChartData<'line'>>(() => {
  if (!dailyViewsData.value || dailyViewsData.value.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = dailyViewsData.value.map(item => new Date(item.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }));
  const data = dailyViewsData.value.map(item => parseInt(item.views, 10));

  return {
    labels,
    datasets: [
      {
        label: 'Lượt xem hàng ngày',
        backgroundColor: 'rgba(73, 69, 255, 0.2)',
        borderColor: '#4945FF',
        data: data,
        fill: true,
        tension: 0.4,
      },
    ],
  };
});

const categoryPieChartData = computed<ChartData<'pie'>>(() => {
  if (!stats.value || !stats.value.topCategoriesByPostCount || stats.value.topCategoriesByPostCount.length === 0) {
    return { labels: [], datasets: [] };
  }

  const labels = stats.value.topCategoriesByPostCount.map(item => item.name);
  const data = stats.value.topCategoriesByPostCount.map(item => item.postCount);

  return {
    labels,
    datasets: [
      {
        backgroundColor: [
          '#41B883', '#E46651', '#00D8FF', '#DD1B16', '#FFC107',
          '#673AB7', '#3F51B5', '#009688', '#FF9800', '#795548'
        ],
        data,
      },
    ],
  };
});

const dailyViewsChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false }
  },
  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
});

const categoryPieChartOptions = ref<ChartOptions<'pie'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
    },
  },
});
</script>

<style scoped>
.b {
  font-size: 3rem;
  font-weight: bold;
  color: #212529; /* Màu đen đậm */
  margin-bottom: 1rem;
  justify-content: center;
}
.card {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
}
.list-group-item-action:hover {
  background-color: #2367ACFF;
}
/* Giới hạn số dòng cho tiêu đề bài viết trong danh sách */
.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
