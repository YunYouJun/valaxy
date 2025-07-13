<script setup lang="ts">
import type { SocialLink } from 'valaxy/types'
import { useAppStore, useValaxyI18n } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  social: SocialLink
}>()

const { $t } = useValaxyI18n()

const appStore = useAppStore()
const color = computed(() => {
  return (appStore.isDark && props.social.color === 'black') ? 'white' : props.social.color
})
</script>

<template>
  <a
    class="links-of-author-item yun-icon-btn"
    rel="noopener" :href="social.link" :title="$t(social.name)"
    target="_blank"
    :style="`color:${color}`"
  >
    <div class="icon" :class="social.icon" />
  </a>
</template>
