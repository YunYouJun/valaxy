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
import { onMounted, ref } from 'vue'
import { useAddonBangumi } from '../client'

defineCustomElements()

const bangumiRef = ref<HTMLElement>()

const bangumiOptions = useAddonBangumi()

const { api, bgmEnabled, bgmUid, bilibiliEnabled, bilibiliUid, customCss } = bangumiOptions.value

onMounted(() => {
  if (!customCss)
    return

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(customCss)
  bangumiRef.value?.shadowRoot?.adoptedStyleSheets.push(sheet)
})
</script>

<template>
  <bilibili-bangumi
    ref="bangumiRef"
    :api="api"
    :bgm-enabled="bgmEnabled"
    :bgm-uid="bgmUid"
    :bilibili-enabled="bilibiliEnabled"
    :bilibili-uid="bilibiliUid"
  />
</template>

<style>
:root[class~="light"] bilibili-bangumi {
  --bbc-primary-color: #425aef;
  --bbc-text-base-color: #24292e;
}

:root[class~="dark"] bilibili-bangumi {
  --bbc-primary-color: #2fd8d8;
  --bbc-text-base-color: #f2f2f2;
}
</style>
