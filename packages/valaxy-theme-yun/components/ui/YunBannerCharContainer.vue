<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    title: string | string[]
    chars?: number[]
    /** Strato uses the banner title as the page h1. */
    heading?: boolean
    fallbackTitle?: string
  }>(),
  {
    chars: () => [],
    heading: false,
  },
)

const headingLabel = computed(() => {
  if (!props.heading)
    return undefined
  const raw = Array.isArray(props.title) ? props.title.join(' ') : props.title
  return raw?.trim() || props.fallbackTitle?.trim() || undefined
})
</script>

<template>
  <component :is="heading ? 'h1' : 'div'" class="banner-char-container" :aria-label="headingLabel">
    <span v-for="c, i in title" :key="i" class="char-box" :aria-hidden="heading ? 'true' : undefined">
      <span
        :class="[i % 2 !== 0 ? 'char-right' : 'char-left']" :style="{
          '--banner-char-size': `${chars[i]}rem`,
        } as CSSProperties"
      >
        <span class="char">
          {{ c }}
        </span>
      </span>
    </span>
  </component>
</template>
