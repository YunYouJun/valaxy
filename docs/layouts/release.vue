<template>
  <div class="release-layout">
    <PressNav />
    <div class="release-content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
/* Match --release-bg so the padding under the fixed nav does not show the body color. */
.release-layout {
  background: #fff;
}

.dark .release-layout {
  background: #08090c;
}

@media (width >= 768px) {
  .release-content {
    padding-top: var(--pr-nav-height);
  }
}
</style>
