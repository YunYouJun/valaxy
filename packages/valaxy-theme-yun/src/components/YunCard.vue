<template>
  <div class="yun-card shadow hover:shadow-lg">
    <div v-if="$slots.header" class="yun-card-header">
      <header>
        <slot name="header" />
      </header>
    </div>
    <slot />
    <div v-if="$slots.content" class="yun-card-content">
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="scss">
.yun-card {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  width: 100%;

  min-height: 100px;

  margin: auto;

  // todo
  background-color: var(--yun-c-bg-light);

  transition: box-shadow var(--yun-transition-duration);

  &-content {
    max-width: 92%;
  }
}
</style>
