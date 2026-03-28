<script lang="ts" setup>
import { ref } from 'vue'

const open = ref(false)

function toggleSearch() {
  open.value = !open.value
}

defineExpose({
  open,
  toggleSearch,
})
</script>

<template>
  <PressFuseSearchButton :open="open" @toggle="toggleSearch" />
  <PressLocalSearchModal :open="open" @close="open = false" />
</template>
