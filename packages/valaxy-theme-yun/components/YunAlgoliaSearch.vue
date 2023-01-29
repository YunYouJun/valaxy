<script lang="ts" setup>
import { useAddonAlgolia } from 'valaxy-addon-algolia'
import { watch } from 'vue'

const props = defineProps<{
  open: boolean
}>()

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
