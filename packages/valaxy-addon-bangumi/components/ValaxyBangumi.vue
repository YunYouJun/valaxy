<script setup lang="ts">
import pkg from 'bilibili-bangumi-component/loader/index.js'

withDefaults(defineProps<{
  api: string
  bilibiliUid?: string
  bgmUid?: string
  bilibiliEnabled?: boolean
  bgmEnabled?: boolean
}>(), {
  bilibiliEnabled: true,
  bgmEnabled: true,
})

const { defineCustomElements } = pkg

defineCustomElements()
</script>

<template>
  <bilibili-bangumi
    :api="api"
    :bilibili-uid="bilibiliUid"
    :bgm-uid="bgmUid"
    :bilibili-enabled="bilibiliEnabled"
    :bgm-enabled="bgmEnabled"
  />
</template>
