<script lang="ts" setup>
import { computed } from 'vue'
import { useBlogConfig, useFrontmatter, useFullUrl } from 'valaxy'

const config = useBlogConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()

const showSponsor = computed(() => {
  if (typeof frontmatter.value.sponsor === 'boolean')
    return frontmatter.value.sponsor

  return config.value.sponsor.enable
})
</script>

<template>
  <Layout>
    <template #main-header-after>
      <YunPostMeta :frontmatter="frontmatter" />
    </template>

    <template #main-content-after>
      <YunSponsor v-if="showSponsor" />
      <ValaxyCopyright v-if="frontmatter.copyright || config.license.enabled" :url="url" m="y-4" />
    </template>

    <template #aside-custom>
      <slot name="aside-custom" />
    </template>
  </Layout>
</template>
