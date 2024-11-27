<script lang="ts" setup>
import type { Article } from '@unhead/schema-org'
import { defineArticle, useSchemaOrg } from '@unhead/schema-org'

import { toDate } from 'date-fns/toDate'
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
  'datePublished': toDate(frontmatter.value.date || ''),
  'dateModified': toDate(frontmatter.value.updated || ''),
}

const image = frontmatter.value.image || frontmatter.value.cover
if (image)
  article.image = image

useSchemaOrg(
  defineArticle(article),
)
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunPostMeta :frontmatter="frontmatter" />

          <YunPostCategoriesAndTags class="mt-2" :frontmatter="frontmatter" />
        </template>

        <template #main-content-after>
          <YunSponsor v-if="showSponsor" m="t-6" />
          <ValaxyCopyright v-if="frontmatter.copyright || (frontmatter.copyright !== false && siteConfig.license.enabled)" :url="url" m="y-4" />
        </template>

        <template #aside-custom>
          <slot name="aside-custom" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>

  <YunFooter />
</template>
