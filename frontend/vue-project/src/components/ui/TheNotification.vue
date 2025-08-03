<template>
  <div class="notification-container">
    <transition-group name="slide-fade" tag="div">
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id" 
        :class="['notification', `notification-${notification.type}`]" 
        role="alert"
      >
        <span>{{ notification.message }}</span>
        <button @click="notificationStore.hide(notification.id)" class="btn-close" aria-label="Close"></button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/store/notification';

const notificationStore = useNotificationStore();
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  width: 350px;
  max-width: 90%;
}

.notification {
  margin-bottom: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
}

.notification-success { background-color: #198754; }
.notification-danger { background-color: #dc3545; }
.notification-info { background-color: #0dcaf0; }
.notification-warning { background-color: #ffc107; }

.btn-close {
  background: transparent;
  border: 0;
  color: #fff;
  opacity: 0.8;
  font-size: 1.2rem;
  padding: 0.5rem;
  margin-left: 1rem;
}

/* Transition styles */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-move {
  transition: transform 0.5s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>