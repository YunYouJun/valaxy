<script lang="ts" setup>
import * as addonWaline from 'valaxy-addon-waline'
import { isEmptyAddon } from 'valaxy'

if (isEmptyAddon(addonWaline))
  throw new Error('Please install valaxy-addon-waline')

const addon = addonWaline.useAddonWaline()
</script>

<template>
  <WalineClient w="full" :options="addon.options || {}" />
</template>
