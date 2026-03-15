<script setup lang="ts">
import type { SocialLink } from 'valaxy/types'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  social: SocialLink
}>()

const { $t } = useValaxyI18n()
</script>

<template>
  <a
    class="links-of-author-item yun-icon-btn"
    :class="{ 'social-link-invert-in-dark': social.color === 'black' }"
    rel="noopener" :href="social.link" :title="$t(social.name)"
    target="_blank"
    :style="`color:${social.color}`"
  >
    <div class="icon" :class="social.icon" />
  </a>
</template>

<style>
/* Invert black icons to white in dark mode via pure CSS, avoiding hydration mismatch */
html.dark .social-link-invert-in-dark {
  color: white !important;
}
</style>
