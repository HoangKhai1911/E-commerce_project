// src/stores/ui.ts
import { defineStore } from 'pinia';

type AlertType = 'success' | 'info' | 'warning' | 'danger';

interface Alert {
  id: number;
  message: string;
  type: AlertType;
}

interface UiState {
  isAppLoading: boolean;
  alerts: Alert[];
}

let nextAlertId = 1;

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
  },
});

