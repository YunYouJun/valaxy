<script setup lang="ts">
import { useSiteConfig } from '../config'
import FootnotePopover from './footnote/FootnotePopover.vue'
import LegacyFootnoteTooltip from './footnote/LegacyFootnoteTooltip.vue'

const siteConfig = useSiteConfig()
</script>

<template>
  <component :is="siteConfig.footnote.preview === 'floating-vue' ? LegacyFootnoteTooltip : FootnotePopover">
    <slot />

    <template #popper>
      <slot name="popper" />
    </template>
  </component>
</template>
