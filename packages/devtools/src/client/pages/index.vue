<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
import { isStaticMode } from '../utils'

onMounted(() => {
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
      <PostPanel />
    </Pane>
  </Splitpanes>
</template>
