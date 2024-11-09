<script setup lang="ts">
import type { CSSProperties } from 'vue'

defineProps<{
  title: string
  chars: number[]
}>()
</script>

<template>
  <div class="banner-char-container">
    <div v-for="c, i in title" :key="i" class="char-box">
      <span
        :class="[i % 2 !== 0 ? 'char-right' : 'char-left']" :style="{
          '--banner-char-size': `${chars[i]}rem`,
        } as CSSProperties"
      >
        <span class="char">
          {{ c }}
        </span>
      </span>
    </div>
  </div>
</template>
