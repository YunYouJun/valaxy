<script lang="ts" setup>
import { onMounted } from 'vue'
import { rpc } from '../rpc'
import { clientPageData } from '../stores/app'

onMounted(async () => {
  clientPageData.value = await rpc.getPageData('')
})
</script>

<template>
  <div p="2">
    <VDPageFrontmatter v-if="clientPageData?.frontmatter" :frontmatter="clientPageData?.frontmatter" />
  </div>
</template>
