<script lang="ts" setup>
defineProps<{ cover?: string }>()
</script>

<template>
  <div
    class="yun-card flex-center rounded"
    flex="col" min-h="100px"
    bg="$va-c-bg-light"
  >
    <img
      v-if="cover"
      width="640" height="360"
      class="object-cover select-none" h="64 md:sm" w="full"
      :src="cover"
      loading="lazy"
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
