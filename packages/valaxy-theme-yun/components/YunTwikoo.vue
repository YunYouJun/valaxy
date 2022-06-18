<script lang="ts" setup>
import { useConfig, useTwikoo } from 'valaxy/client'

const config = useConfig()
useTwikoo(config.value.comment.twikoo)
</script>

<template>
  <div id="tcomment" w="full" />
</template>

<style lang="scss">
// custom twikoo style
</style>
