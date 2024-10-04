<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore, useFrontmatter, useFullUrl, useSiteConfig } from 'valaxy'

import type { Article } from '@unhead/schema-org'
import { defineArticle, useSchemaOrg } from '@unhead/schema-org'
import { toDate } from 'date-fns'

const app = useAppStore()
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
  <div
    flex="~"
    class="mt-24 md:mt-36 w-full max-w-screen-2xl m-auto justify-center items-start gap-4"
    :class="{
      'flex-col': app.isMobile,
    }"
  >
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

    <YunAside v-if="!app.isMobile" />
  </div>

  <YunFooter />
</template>
