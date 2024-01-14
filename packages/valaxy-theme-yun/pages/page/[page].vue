<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const pageIndex = computed(() => Number.parseInt((route.params as { page: string }).page))
</script>

<template>
  <YunPostList :cur-page="pageIndex" />
</template>
