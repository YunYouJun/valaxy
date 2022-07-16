<script lang="ts" setup>
import { useSite, useTwikoo } from 'valaxy'

const config = useSite()
useTwikoo(config.value.comment.twikoo)
</script>

<template>
  <div id="tcomment" w="full" />
</template>

<style lang="scss">
// custom twikoo style
</style>
