<template>
  <div class="container py-5 d-flex flex-column justify-content-center align-items-center min-vh-75 text-center">
    <h1 class="display-1 fw-bold text-danger mb-3">404</h1>
    <h2 class="mb-4 text-dark">Trang không tìm thấy</h2>
    <p class="lead text-muted mb-5">Rất tiếc, trang bạn đang tìm kiếm không tồn tại.</p>
    <RouterLink to="/" class="btn btn-primary btn-lg shadow-sm">
      <i class="bi bi-house-door-fill me-2"></i>Quay về Trang chủ
    </RouterLink>
  </div>
</template>

<style lang="scss" scoped>
.min-vh-75 {
  min-height: 75vh;
}
</style>