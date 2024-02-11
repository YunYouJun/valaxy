<script lang="ts" setup>
import { computed } from 'vue'
import { useFrontmatter, useFullUrl, useSiteConfig } from 'valaxy'

import type { Article } from '@unhead/schema-org'
import { defineArticle, useSchemaOrg } from '@unhead/schema-org'
import dayjs from 'dayjs'

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const url = useFullUrl()

const showSponsor = computed(() => {
  if (typeof frontmatter.value.sponsor === 'boolean')
    return frontmatter.value.sponsor

  return siteConfig.value.sponsor.enable
})

const article: Article = {
  '@type': 'BlogPosting',
  'headline': frontmatter.value.title,
  'description': frontmatter.value.description,
  'author': [
    {
      name: siteConfig.value.author.name,
      url: siteConfig.value.author.link,
    },
  ],
  'datePublished': dayjs(frontmatter.value.date).toDate(),
  'dateModified': dayjs(frontmatter.value.updated).toDate(),
}

const image = frontmatter.value.image || frontmatter.value.cover
if (image)
  article.image = image

useSchemaOrg(
  defineArticle(article),
)
</script>

<template>
  <RouterView v-slot="{ Component }">
    <component :is="Component">
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
    </component>
  </RouterView>
</template>
