<script lang="ts" setup>
import consola from 'consola'
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
import { rpc } from '../../rpc'
import { isStaticMode } from '../../utils'

onMounted(async () => {
  if (isStaticMode)
    document.title = 'Valaxy DevTools (Production)'

  const data = await rpc.getPostList()
  consola.log('data', data)
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
