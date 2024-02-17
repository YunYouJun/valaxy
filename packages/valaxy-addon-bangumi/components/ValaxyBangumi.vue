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
import { useAddonBangumi } from '../client'

defineCustomElements()

const bangumiOptions = useAddonBangumi()

const { api, bgmEnabled, bgmUid, bilibiliEnabled, bilibiliUid } = bangumiOptions.value
</script>

<template>
  <bilibili-bangumi
    :api="api"
    :bgm-enabled="bgmEnabled"
    :bgm-uid="bgmUid"
    :bilibili-enabled="bilibiliEnabled"
    :bilibili-uid="bilibiliUid"
  />
</template>
