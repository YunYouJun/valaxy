<script lang="ts" setup>
import * as addonTwikoo from 'valaxy-addon-twikoo'
import 'valaxy-addon-twikoo/client/styles/index.scss'
import { isEmptyAddon } from 'valaxy'
import { onBeforeUnmount } from 'vue'

if (!isEmptyAddon(addonTwikoo))
  addonTwikoo.useTwikooWithOptions()

onBeforeUnmount(() => {
  document.querySelector('#twikoo')?.remove()
})
</script>

<template>
  <div id="tcomment" w="full" />
</template>
