<script setup lang="ts">
import { useFrontmatter, useFullUrl, useSiteConfig } from 'valaxy'
import { computed } from 'vue'

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()

const showSponsor = computed(() => {
  if (typeof frontmatter.value.sponsor === 'boolean')
    return frontmatter.value.sponsor

  return siteConfig.value.sponsor.enable
})
</script>

<template>
  <YunSponsor v-if="showSponsor" m="t-6" />
  <ValaxyCopyright v-if="frontmatter.copyright || (frontmatter.copyright !== false && siteConfig.license.enabled)" :url="url" m="y-4" />
</template>
