<script lang="ts" setup>
defineProps<{
  src?: string
}>()
</script>

<template>
  <img
    v-if="src"
    width="640" height="360"
    class="yun-cover object-cover select-none" h="64 md:sm" w="full"
    :src="src"
    loading="lazy"
    alt=""
  >
</template>
