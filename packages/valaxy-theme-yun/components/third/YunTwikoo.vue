<script lang="ts" setup>
import { isEmptyAddon } from 'valaxy'
import * as addonTwikoo from 'valaxy-addon-twikoo'
import 'valaxy-addon-twikoo/client/styles/index.scss'

if (!isEmptyAddon(addonTwikoo))
  addonTwikoo.useTwikooWithOptions()
</script>

<template>
  <div>
    <div id="tcomment" w="full" />
  </div>
</template>
