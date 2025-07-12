<script lang="ts" setup>
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'

import dayjs from 'dayjs'
import { tObject, useFrontmatter, useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()

const { locale } = useI18n()
const article: Parameters<typeof defineArticle>[0] = {
  '@type': 'BlogPosting',
  'headline': tObject(frontmatter.value.title || '', locale.value),
  'description': tObject(frontmatter.value.description || '', locale.value),
  'author': [
    {
      name: siteConfig.value.author.name,
      url: siteConfig.value.author.link,
    },
  ],
  'datePublished': dayjs(frontmatter.value.date || '').toDate(),
  'dateModified': dayjs(frontmatter.value.updated || '').toDate(),
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
          <YunMainHeaderAfter />
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
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
