<template>
  <div class="release-layout">
    <PressNav />
    <div class="release-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
@media (width >= 768px) {
  .release-content {
    padding-top: var(--pr-nav-height);
  }
}
</style>
