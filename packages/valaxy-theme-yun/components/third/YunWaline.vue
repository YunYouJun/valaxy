<script lang="ts" setup>
import type { Ref } from 'vue'
import { getAddonModule, isEmptyAddon } from 'valaxy'
import * as addonWaline from 'valaxy-addon-waline'

if (isEmptyAddon(addonWaline))
  throw new Error('Please install valaxy-addon-waline')

const addon = getAddonModule<{
  useAddonWaline: () => Ref<{ options?: Record<string, any> } | undefined>
}>(addonWaline).useAddonWaline()
</script>

<template>
  <WalineClient
    w="full" :options="addon?.options || {
      serverURL: '',
    }"
  />
</template>
