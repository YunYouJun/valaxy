<template>
  <div class="yun-card">
    <div v-if="$slots.header" class="yun-card-header">
      <header>
        <slot name="header" />
      </header>
    </div>
    <slot />
    <div v-if="$slots.content" class="yun-card-content" w="full">
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

  min-height: 100px;

  margin: auto;

  // todo
  background-color: var(--va-c-bg-light);
}
</style>
