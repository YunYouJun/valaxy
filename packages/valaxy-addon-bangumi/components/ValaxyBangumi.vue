<script setup lang="ts">
/**
 * The ESM module will be mistakenly identified as CJS. Importing like this:
 * import { defineCustomElements } from "bilibili-bangumi-component/loader";
 *
 * reference https://github.com/YunYouJun/valaxy/pull/346
 */
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
import { defineCustomElements } from 'bilibili-bangumi-component/dist/cjs/loader.cjs'

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
