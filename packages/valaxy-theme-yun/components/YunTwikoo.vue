<script lang="ts" setup>
import { useSiteConfig, useTwikoo } from 'valaxy'

const config = useSiteConfig()
useTwikoo(config.value.comment.twikoo)
</script>

<template>
  <div id="tcomment" w="full" />
</template>

<style lang="scss">
// custom twikoo style
</style>
