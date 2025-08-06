<template>
  <div class="card h-100 shadow-sm border-0 overflow-hidden" aria-hidden="true">
    <div class="skeleton-image card-img-top"></div>
    <div class="card-body d-flex flex-column">
      <div class="mb-3 placeholder-glow">
        <span class="placeholder col-4 me-2 rounded-pill"></span>
        <span class="placeholder col-3 rounded-pill"></span>
      </div>
      <h5 class="card-title placeholder-glow">
        <span class="placeholder col-10 d-block mb-2"></span>
        <span class="placeholder col-7 d-block"></span>
      </h5>
      <div class="mt-auto placeholder-glow">
        <span class="placeholder col-5"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-image {
  height: 200px;
  background-color: #e9ecef;
  animation: placeholder-glow 2s ease-in-out infinite;
}
</style>