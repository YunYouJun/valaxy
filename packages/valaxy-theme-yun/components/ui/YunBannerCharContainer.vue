<script setup lang="ts">
import type { CSSProperties } from 'vue'

withDefaults(
  defineProps<{
    title: string | string[]
    chars?: number[]
    /** Strato uses the banner title as the page h1. */
    heading?: boolean
  }>(),
  {
    chars: () => [],
    heading: false,
  },
)
</script>

<template>
  <component :is="heading ? 'h1' : 'div'" class="banner-char-container">
    <span v-for="c, i in title" :key="i" class="char-box">
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
