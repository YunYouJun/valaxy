<script lang="ts" setup>
import type { YunTheme } from '../types'
import { createFireworks } from '@explosions/fireworks'
import { useThemeConfig } from 'valaxy'
import { onMounted } from 'vue'

const themeConfig = useThemeConfig<YunTheme.Config>()

onMounted(() => {
  createFireworks({
    selector: 'canvas.fireworks',
    colors: themeConfig.value.fireworks.colors,
  })
})
</script>

<template>
  <canvas class="fireworks" />
</template>

<style>
canvas.fireworks {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1;
  pointer-events: none;
}
</style>
