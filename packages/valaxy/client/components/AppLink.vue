<script setup lang="ts">
// https://router.vuejs.org/guide/advanced/extending-router-link.html#extending-routerlink
import { computed } from 'vue'

const props = defineProps<{
  showExternalIcon?: boolean
  to?: string
  href?: string
}>()

const isExternalLink = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http')
})
</script>

<template>
  <a v-if="isExternalLink || href" v-bind="$attrs" :href="href || to" target="_blank">
    <slot />
    <div v-if="showExternalIcon" class="icon-link inline-block" i-ri-arrow-right-up-line />
  </a>
  <router-link v-else v-bind="$props as any">
    <slot />
  </router-link>
</template>
