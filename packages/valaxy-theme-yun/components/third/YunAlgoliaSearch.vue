<script lang="ts" setup>
import { isEmptyAddon } from 'valaxy'
import * as addonAlgolia from 'valaxy-addon-algolia'
import { onMounted, onUnmounted } from 'vue'

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

function isEditingContent(event: KeyboardEvent): boolean {
  const element = event.target as HTMLElement
  const tagName = element.tagName

  return (
    element.isContentEditable
    || tagName === 'INPUT'
    || tagName === 'SELECT'
    || tagName === 'TEXTAREA'
  )
}

onMounted(() => {
  const handleSearchHotKey = (event: KeyboardEvent) => {
    if (
      (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))
      || (!isEditingContent(event) && event.key === '/')
    ) {
      event.preventDefault()
      load()
      // eslint-disable-next-line ts/no-use-before-define
      remove()
    }
  }

  const remove = () => {
    window.removeEventListener('keydown', handleSearchHotKey)
  }

  window.addEventListener('keydown', handleSearchHotKey)

  onUnmounted(remove)
})
</script>

<template>
  <AlgoliaSearchBox v-if="loaded" class="hidden" />
</template>
