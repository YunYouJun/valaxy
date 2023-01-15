<script lang="ts" setup>
import type { Post } from 'valaxy'
import YunPostMeta from 'valaxy-theme-yun/components/YunPostMeta.vue'

defineProps<{
  frontmatter: Post
}>()
</script>

<template>
  <YunPostMeta :frontmatter="frontmatter">
    <span id="busuanzi_container_page_pv">
      本文总阅读量 <span id="busuanzi_value_page_pv" /> 次
    </span>
  </YunPostMeta>
</template>
