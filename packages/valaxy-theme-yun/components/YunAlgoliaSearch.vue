<script lang="ts" setup>
import { watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

const { useAddonAlgolia } = await import('valaxy-addon-algolia')

const { loaded, load, dispatchEvent } = useAddonAlgolia()

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
