import { defineStore } from 'pinia';
import { ref } from 'vue';

type NotificationType = 'success' | 'danger' | 'info' | 'warning';

interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<Notification[]>([]);

  function show(
    message: string,
    type: NotificationType = 'success',
    duration = 4000
  ) {
    const id = Date.now() + Math.random();
    notifications.value.push({ id, message, type });
    setTimeout(() => hide(id), duration);
  }

  function hide(id: number) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }

  function clearAll() {
    notifications.value = [];
  }

  return { notifications, show, hide, clearAll };
});

