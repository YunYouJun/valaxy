<template>
  <div class="yun-card shadow hover:shadow-lg">
    <div class="yun-card-header">
      <header>
        <slot name="header" />
      </header>
    </div>
    <div class="yun-card-content">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.yun-card {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 100%;

  max-width: 900px;
  min-height: 100px;

  margin: auto;

  // todo
  background-color: var(--yun-c-bg);

  transition: box-shadow var(--yun-transition-duration);
}
</style>
