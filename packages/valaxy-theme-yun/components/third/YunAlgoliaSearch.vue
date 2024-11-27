<script lang="ts" setup>
import { isEmptyAddon } from 'valaxy'
import * as addonAlgolia from 'valaxy-addon-algolia'

defineProps<{
  open: boolean
}>()

if (isEmptyAddon(addonAlgolia))
  throw new Error('Algolia addon is not installed')

const { loaded, load, dispatchEvent } = addonAlgolia.useAddonAlgolia()

defineExpose({
  loaded,
  load,
  dispatchEvent,
})
</script>

<template>
  <AlgoliaSearchBox v-if="loaded" class="hidden" />
</template>
