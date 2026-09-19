<script setup lang="ts">
import ThemePressHome from 'valaxy-theme-press/components/PressHome.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeAiThemes from './home/HomeAiThemes.vue'

const route = useRoute()
const lang = computed(() => route.path.startsWith('/zh/') ? 'zh' : 'en')
</script>

<template>
  <ThemePressHome>
    <template #home-features-after>
      <HomeAiThemes :lang="lang" />
    </template>
  </ThemePressHome>
</template>
