import { ref, watch } from 'vue';
import type { Ref, WatchSource } from 'vue';
import axios from 'axios';

/**
 * Interface cho các tùy chọn của composable.
 * @template T - Kiểu dữ liệu của data.
 */
interface UseApiOptions<T> {
  initialData?: T;
  immediate?: boolean;
  watchSources?: WatchSource | WatchSource[];
  debounce?: number;
}

/**
 * Interface cho giá trị trả về của composable.
 * @template T - Kiểu dữ liệu của data.
 */
interface UseApiReturn<T> {
  data: Ref<T | null>;
  error: Ref<string | null>;
  isLoading: Ref<boolean>;
  execute: (...args: any[]) => Promise<void>;
}

/**
 * Một composable function để xử lý các cuộc gọi API với trạng thái loading và error.
 * @template T - Kiểu dữ liệu mong đợi từ API.
 * @param apiCall - Một hàm trả về một promise từ API client (ví dụ: `() => api.get('/posts')`).
 *                  Hàm này sẽ nhận các tham số từ `watchSources` và một object chứa `signal` ở cuối.
 * @param options - Các tùy chọn, bao gồm `initialData`, `immediate`, `watchSources` và `debounce`.
 * @returns Một đối tượng chứa data, error, isLoading, và hàm `execute` để thực hiện cuộc gọi.
 */
export function useApi<T>(
  apiCall: (...args: any[]) => Promise<{ data: T }>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T> {
  // Mặc định `immediate` là true, để tự động gọi API.
  const { initialData, immediate = true, watchSources, debounce = 0 } = options;

  const data = ref(initialData || null) as Ref<T | null>;
  const error = ref<string | null>(null);
  const isLoading = ref(false);
  
  let controller: AbortController;
  let debounceTimeout: number;

  const execute = async (...args: any[]) => {
    // Hủy request trước đó nếu đang có một request chạy
    if (controller) {
      controller.abort();
    }
    // Tạo một controller mới cho request hiện tại
    controller = new AbortController();

    isLoading.value = true;
    error.value = null;
    try {
      // Truyền các tham số và object chứa signal vào hàm gọi API
      const response = await apiCall(...args, { signal: controller.signal });
      data.value = response.data;
    } catch (err) {
      // Nếu lỗi là do hủy request, không báo lỗi mà chỉ log ra console
      if (axios.isCancel(err)) {
        console.log('Request canceled:', (err as Error).message);
      } else {
        const errorObj = err as any;
        console.error('Lỗi khi gọi API:', errorObj);
        error.value = errorObj.response?.data?.error?.message || errorObj.message || 'Đã có lỗi không xác định xảy ra.';
      }
    } finally {
      isLoading.value = false;
    }
  };

  if (watchSources) {
    watch(
      watchSources,
      (newValues) => {
        // Hủy bỏ timeout trước đó nếu có
        clearTimeout(debounceTimeout);

        if (debounce > 0) {
          // Đặt một timeout mới
          debounceTimeout = window.setTimeout(() => {
            execute(...(Array.isArray(newValues) ? newValues : [newValues]));
          }, debounce);
        } else {
          // Nếu không có debounce, thực thi ngay lập tức
          execute(...(Array.isArray(newValues) ? newValues : [newValues]));
        }
      },
      { immediate, deep: true } // Sử dụng `immediate` để gọi lần đầu, `deep` để theo dõi object/array
    );
  } else if (immediate) {
    // Giữ lại logic cũ nếu không có `watchSources`
    execute();
  }

  return { data, error, isLoading, execute };
}