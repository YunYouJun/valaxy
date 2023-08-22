<script lang="ts" setup>
import * as addonTwikoo from 'valaxy-addon-twikoo'
import 'valaxy-addon-twikoo/client/styles/index.scss'
import { isEmptyAddon } from 'valaxy'

if (!isEmptyAddon(addonTwikoo))
  addonTwikoo.useTwikooWithOptions()
</script>

<template>
  <div id="tcomment" w="full" />
</template>
