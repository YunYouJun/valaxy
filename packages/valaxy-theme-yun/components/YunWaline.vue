<script lang="ts" setup>
import { useConfig } from 'valaxy'
const config = useConfig()
</script>

<template>
  <WalineClient w="full" :server-u-r-l="config.comment.waline.serverURL" :cdn="config.cdn.prefix" />
</template>
