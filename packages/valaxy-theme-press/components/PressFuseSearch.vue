<script lang="ts" setup>
import { ref } from 'vue'

const open = ref(false)

function toggleSearch() {
  open.value = !open.value
}
</script>

<template>
  <PressFuseSearchButton :open="open" @toggle="toggleSearch" />
  <PressFuseSearchModal :open="open" @close="open = false" />
</template>
