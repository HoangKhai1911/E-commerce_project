<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useApi } from '@/composables/useApi';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';

const authStore = useAuthStore();
const api = useApi();

const username = ref('');
const email = ref('');
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');

const isLoading = ref(true);
const isUpdatingProfile = ref(false);
const isUpdatingPassword = ref(false);
const errorMessage = ref<string | null>(null);
const successMessage = ref<string | null>(null);

onMounted(async () => {
  if (authStore.user) {
    username.value = authStore.user.username;
    email.value = authStore.user.email;
  } else {
    // Nếu user chưa được tải (ví dụ: refresh trang), tải lại
    await authStore.fetchUser();
    if (authStore.user) {
      username.value = authStore.user.username;
      email.value = authStore.user.email;
    }
  }
  isLoading.value = false;
});

const handleProfileUpdate = async () => {
  errorMessage.value = null;
  successMessage.value = null;
  isUpdatingProfile.value = true;
  try {
    const updateData: { username?: string; email?: string } = {};
    if (username.value !== authStore.user?.username) {
      updateData.username = username.value;
    }
    if (email.value !== authStore.user?.email) {
      updateData.email = email.value;
    }

    if (Object.keys(updateData).length === 0) {
      successMessage.value = 'Không có thông tin nào được thay đổi.';
      return;
    }

    await api.put('/user/me', updateData);
    await authStore.fetchUser(); // Cập nhật lại thông tin user trong store
    successMessage.value = 'Thông tin cá nhân đã được cập nhật thành công!';
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Cập nhật thông tin thất bại.';
    console.error('Profile update error:', err);
  } finally {
    isUpdatingProfile.value = false;
  }
};

const handlePasswordUpdate = async () => {
  errorMessage.value = null;
  successMessage.value = null;
  isUpdatingPassword.value = true;

  if (newPassword.value !== confirmNewPassword.value) {
    errorMessage.value = 'Mật khẩu mới và mật khẩu xác nhận không khớp.';
    isUpdatingPassword.value = false;
    return;
  }
  if (!currentPassword.value || !newPassword.value) {
      errorMessage.value = 'Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.';
      isUpdatingPassword.value = false;
      return;
  }

  try {
    // Strapi's users-permissions plugin handles password changes via its own PUT /users/:id endpoint
    // Your custom /user/me PUT endpoint might need to forward this or you can call the plugin's directly.
    // For simplicity, let's assume your custom /user/me endpoint handles password update if 'password' is sent.
    await api.put('/user/me', {
      currentPassword: currentPassword.value,
      password: newPassword.value,
      passwordConfirmation: confirmNewPassword.value,
    });
    successMessage.value = 'Mật khẩu đã được cập nhật thành công!';
    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
  } catch (err: any) {
    errorMessage.value = err.response?.data?.message || 'Cập nhật mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.';
    console.error('Password update error:', err);
  } finally {
    isUpdatingPassword.value = false;
  }
};

const handleDeleteAccount = async () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản của mình? Thao tác này không thể hoàn tác!')) {
        try {
            await api.delete('/user/me');
            await authStore.logout(); // Đăng xuất sau khi xóa tài khoản
            router.push({ name: 'Login' }); // Chuyển hướng về trang đăng nhập
            alert('Tài khoản của bạn đã được xóa thành công.');
        } catch (err: any) {
            errorMessage.value = err.response?.data?.message || 'Xóa tài khoản thất bại.';
            console.error('Delete account error:', err);
        }
    }
};
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <h2 class="mb-4 text-center text-primary fw-bold">Hồ sơ của tôi</h2>

        <LoadingSpinner v-if="isLoading" class="my-5" />
        <BaseAlert v-if="errorMessage" :message="errorMessage" type="danger" class="mb-4" />
        <BaseAlert v-if="successMessage" :message="successMessage" type="success" class="mb-4" />

        <div v-if="!isLoading">
          <div class="card shadow-sm mb-4">
            <div class="card-header bg-primary text-white fw-bold">Thông tin cá nhân</div>
            <div class="card-body">
              <form @submit.prevent="handleProfileUpdate">
                <div class="mb-3">
                  <BaseInput
                    id="profile-username"
                    label="Tên người dùng"
                    type="text"
                    v-model="username"
                    required
                  />
                </div>
                <div class="mb-4">
                  <BaseInput
                    id="profile-email"
                    label="Email"
                    type="email"
                    v-model="email"
                    disabled
                  />
                  <small class="form-text text-muted">Email không thể thay đổi.</small>
                </div>
                <BaseButton type="submit" :loading="isUpdatingProfile" class="btn-primary">
                  Cập nhật thông tin
                </BaseButton>
              </form>
            </div>
          </div>

          <div class="card shadow-sm mb-4">
            <div class="card-header bg-secondary text-white fw-bold">Thay đổi mật khẩu</div>
            <div class="card-body">
              <form @submit.prevent="handlePasswordUpdate">
                <div class="mb-3">
                  <BaseInput
                    id="current-password"
                    label="Mật khẩu hiện tại"
                    type="password"
                    v-model="currentPassword"
                    required
                  />
                </div>
                <div class="mb-3">
                  <BaseInput
                    id="new-password"
                    label="Mật khẩu mới"
                    type="password"
                    v-model="newPassword"
                    required
                  />
                </div>
                <div class="mb-4">
                  <BaseInput
                    id="confirm-new-password"
                    label="Xác nhận mật khẩu mới"
                    type="password"
                    v-model="confirmNewPassword"
                    required
                  />
                </div>
                <BaseButton type="submit" :loading="isUpdatingPassword" class="btn-secondary">
                  Đổi mật khẩu
                </BaseButton>
              </form>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header bg-info text-white fw-bold">Tùy chọn khác</div>
            <div class="card-body">
              <div class="d-flex flex-column flex-md-row justify-content-between align-items-center">
                <RouterLink to="/profile/preferences" class="btn btn-outline-primary mb-3 mb-md-0">
                  <i class="bi bi-gear me-2"></i>Quản lý sở thích
                </RouterLink>
                <BaseButton @click="handleDeleteAccount" type="button" class="btn-outline-danger">
                  <i class="bi bi-trash me-2"></i>Xóa tài khoản
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-header {
  font-size: 1.15rem;
  padding: 1rem 1.25rem;
}
.text-primary {
    color: var(--bs-primary) !important;
}
</style>