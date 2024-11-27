<script lang="ts" setup>
import { isEmptyAddon } from 'valaxy'
import * as addonWaline from 'valaxy-addon-waline'

if (isEmptyAddon(addonWaline))
  throw new Error('Please install valaxy-addon-waline')

const addon = addonWaline.useAddonWaline()
</script>

<template>
  <WalineClient
    w="full" :options="addon.options || {
      serverURL: '',
    }"
  />
</template>
