<script setup lang="ts">
// https://router.vuejs.org/guide/advanced/extending-router-link.html#extending-routerlink
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { EXTERNAL_URL_RE } from '../../shared'

const props = defineProps<{
  showExternalIcon?: boolean
  to?: string
  href?: string
  target?: string
}>()

const link = computed(() => props.href || props.to || '#')

const isExternalLink = computed(() => {
  return (link.value && EXTERNAL_URL_RE.test(link.value)) || props.target === '_blank'
})
</script>

<template>
  <a
    v-if="isExternalLink" class="va-link" v-bind="$attrs" :href="link"
    :target="target ?? (isExternalLink ? '_blank' : undefined)"
  >
    <slot />
    <div v-if="showExternalIcon" class="icon-link inline-block" i-ri-arrow-right-up-line />
  </a>
  <RouterLink v-else class="va-link" v-bind="$attrs" :to="link">
    <slot />
  </RouterLink>
</template>
