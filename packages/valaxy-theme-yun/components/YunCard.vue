<script lang="ts" setup>
defineProps<{ cover?: string }>()
</script>

<template>
  <div class="yun-card">
    <img
      v-if="cover"
      width="640" height="360"
      class="object-cover select-none" h="64 md:sm" w="full" :src="cover"
    >

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

  // todo
  background-color: var(--va-c-bg-light);
}
</style>
