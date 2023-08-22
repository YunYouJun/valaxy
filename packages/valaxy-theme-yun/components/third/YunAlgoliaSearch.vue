<script lang="ts" setup>
import * as addonAlgolia from 'valaxy-addon-algolia'
import { isEmptyAddon } from 'valaxy'
import { watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

if (isEmptyAddon(addonAlgolia))
  throw new Error('Algolia addon is not installed')

const { loaded, load, dispatchEvent } = addonAlgolia.useAddonAlgolia()
watch(() => props.open, () => {
  if (props.open)
    load()

  if (loaded)
    dispatchEvent()
})
</script>

<template>
  <AlgoliaSearchBox v-if="loaded" class="hidden" />
</template>
