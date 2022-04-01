<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to: string
}>()

const isExternalLink = computed(() => {
  return typeof props.to === 'string' && props.to.startsWith('http')
})
</script>

<template>
  <a v-if="isExternalLink" v-bind="$attrs" :href="to" target="_blank">
    <slot />
  </a>
  <router-link v-else v-bind="$props">
    <slot />
  </router-link>
</template>
