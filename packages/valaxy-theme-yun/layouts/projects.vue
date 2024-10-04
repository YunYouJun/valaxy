<script setup lang="ts">
import { useFrontmatter, useSiteConfig } from 'valaxy'

// layout
const siteConfig = useSiteConfig()
const fm = useFrontmatter()
</script>

<template>
  <YunLayoutWrapper>
    <div flex="~ col">
      <YunProjects />
      <!-- <YunLayoutLeft /> -->
      <!-- <RouterView /> -->
      <!-- <YunLayoutRight /> -->
      <YunSponsor class="mt-4" />
      <YunComment
        v-if="siteConfig.comment.enable && fm.comment !== false"
        class="max-w-4xl m-auto"
      />
    </div>
  </YunLayoutWrapper>

  <YunFooter />
</template>
