<script lang="ts" setup>
import { useTwikooWithOptions } from 'valaxy-addon-twikoo'

useTwikooWithOptions()
</script>

<template>
  <div id="tcomment" w="full" />
</template>

<style lang="scss">
// custom twikoo style
#twikoo .el-loading-spinner {
  top: 65%;
  right: -50%;
}
</style>
