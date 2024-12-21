<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
import { isStaticMode } from '../utils'

onMounted(async () => {
  if (isStaticMode)
    document.title = 'Valaxy DevTools (Production)'
})
</script>

<template>
  <Splitpanes class="h-full">
    <Pane>
      <VDPostList />
    </Pane>
    <Pane>
      <VDPostPanel />
    </Pane>
  </Splitpanes>
</template>
