import { defineStore } from 'pinia';
import { ref } from 'vue'; // ref cần thiết nếu bạn muốn sử dụng nó trong showConfirm, mặc dù ở đây dùng window.confirm

// Định nghĩa kiểu cho Alert
export type AlertType = 'success' | 'info' | 'warning' | 'danger';

export interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

interface UiState {
  isAppLoading: boolean;
  alerts: Alert[];
}

let nextAlertId = 1; // Sử dụng let thay vì const để có thể tăng giá trị

function getInitialState(): UiState {
  return {
    isAppLoading: false,
    alerts: [],
  };
}

export const useUiStore = defineStore('ui', {
  state: getInitialState,

  actions: {
    setAppLoading(isLoading: boolean) {
      this.isAppLoading = isLoading;
    },

    addAlert(message: string, type: AlertType = 'info', duration = 5000) {
      const id = nextAlertId++;
      this.alerts.push({ id, message, type });
      setTimeout(() => this.removeAlert(id), duration);
    },

    removeAlert(id: number) {
      this.alerts = this.alerts.filter((alert) => alert.id !== id);
    },

    clearAlerts() {
      this.alerts = [];
    },

    reset() {
      Object.assign(this, getInitialState());
    },

    /**
     * Hiển thị một modal xác nhận tùy chỉnh.
     * Cần một component modal thực tế để hoạt động.
     * @param message Thông điệp xác nhận
     * @param title Tiêu đề modal
     * @returns Promise<boolean> true nếu xác nhận, false nếu hủy
     */
    showConfirm(message: string, title: string = 'Xác nhận'): Promise<boolean> {
      // Tạm thời sử dụng window.confirm để code chạy được và lỗi TypeScript biến mất.
      // Bạn PHẢI thay thế dòng này bằng logic hiển thị modal Vue của mình.
      // Ví dụ: sử dụng một component modal Vue tùy chỉnh và giải quyết Promise
      // khi người dùng nhấp vào nút "Xác nhận" hoặc "Hủy".
      return new Promise((resolve) => {
        const result = window.confirm(`${title}\n\n${message}`);
        resolve(result);
      });
    },
  },
});
