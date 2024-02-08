<script setup lang="ts">
import { defineCustomElements } from 'bilibili-bangumi-component/loader'

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
