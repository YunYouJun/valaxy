<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { isClient } from '@vueuse/core'
import { useAddonBangumi } from '../client'

const bangumiRef = ref<HTMLElement>()
const customCssInjected = ref(false)

const bangumiOptions = useAddonBangumi()

const { api, bgmEnabled, bgmUid, bilibiliEnabled, bilibiliUid, customCss, customEnabled, customLabel, pageSize } = bangumiOptions.value

function injectCustomCss() {
  if (!customCss || customCssInjected.value)
    return

  const sheet = new CSSStyleSheet()
  sheet.replaceSync(customCss)
  bangumiRef.value?.shadowRoot?.adoptedStyleSheets.push(sheet)

  if (bangumiRef.value?.shadowRoot)
    customCssInjected.value = true
}

;(async () => {
  if (!isClient)
    return
  const { defineCustomElements } = await import('bilibili-bangumi-component/loader')
  defineCustomElements()

  // Web Component may not define when vue component mount
  injectCustomCss()
})()

onMounted(() =>
  injectCustomCss(),
)
</script>

<template>
  <bilibili-bangumi
    ref="bangumiRef"
    :api="api"
    :bgm-enabled="bgmEnabled"
    :bgm-uid="bgmUid"
    :bilibili-enabled="bilibiliEnabled"
    :bilibili-uid="bilibiliUid"
    :custom-enabled="customEnabled"
    :custom-label="customLabel"
    :page-size="pageSize"
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
