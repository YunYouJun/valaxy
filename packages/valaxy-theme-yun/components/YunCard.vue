<script lang="ts" setup>
defineProps<{ cover?: string, coverComponent?: string, coverProps?: Record<string, unknown> }>()
</script>

<template>
  <div
    class="yun-card flex-center overflow-hidden" flex="col"
    min-h="100px"
    bg="$va-c-bg-light"
  >
    <YunCover :src="cover" :component="coverComponent" :component-props="coverProps" />

    <div v-if="$slots.header" class="yun-card-header">
      <header>
        <slot name="header" />
      </header>
    </div>
    <div class="yun-card-body relative" w="full" flex="~ col" items="center">
      <slot />
    </div>
    <div v-if="$slots.content" class="yun-card-content" w="full">
      <slot name="content" />
    </div>
  </div>
</template>

<style scoped>
:where(.yun-card) {
  border: 1px solid var(--yun-surface-line);
  box-shadow: var(--yun-card-shadow);
}

.yun-card {
  border-radius: var(--va-card-border-radius, 0.5rem);
}
</style>
