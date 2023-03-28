<script lang="ts" setup>
import { computed } from 'vue'
import { useFrontmatter, useFullUrl, useSiteConfig } from 'valaxy'

import { defineArticle, useSchemaOrg } from '@vueuse/schema-org'

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()

const showSponsor = computed(() => {
  if (typeof frontmatter.value.sponsor === 'boolean')
    return frontmatter.value.sponsor

  return siteConfig.value.sponsor.enable
})

useSchemaOrg(
  defineArticle({
    '@type': 'BlogPosting',
    'headline': frontmatter.value.title,
    'description': frontmatter.value.description,
    'author': [
      {
        name: siteConfig.value.author.name,
        url: siteConfig.value.author.link,
      },
    ],
  }),
)
</script>

<template>
  <Layout>
    <template #main-header-after>
      <YunPostMeta :frontmatter="frontmatter" />
      <YunWalineMeta />
      <YunPostCategoriesAndTags :frontmatter="frontmatter" />
    </template>

    <template #main-content-after>
      <YunSponsor v-if="showSponsor" m="t-6" />
      <ValaxyCopyright v-if="frontmatter.copyright || siteConfig.license.enabled" :url="url" m="y-4" />
    </template>

    <template #aside-custom>
      <slot name="aside-custom" />
    </template>
  </Layout>
</template>
