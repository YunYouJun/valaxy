<script lang="ts" setup>
import { useBlogConfig, useTwikoo } from 'valaxy'

const config = useBlogConfig()
useTwikoo(config.value.comment.twikoo)
</script>

<template>
  <div id="tcomment" w="full" />
</template>

<style lang="scss">
// custom twikoo style
</style>
