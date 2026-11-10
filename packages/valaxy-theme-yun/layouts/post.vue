<script lang="ts" setup>
import { defineArticle, useSchemaOrg } from '@unhead/schema-org/vue'

import dayjs from 'dayjs'
import { pickShareImage, resolveShareImage, resolveSiteUrl, useFrontmatter, useSiteConfig, useValaxyI18n } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useYunCollection } from '../composables/collection'
import { useYunLocalMenu } from '../composables/localMenu'

const { collection, currentIndex } = useYunCollection()
const { menuOpen, toggleMenu } = useYunLocalMenu()
const { t } = useI18n()
const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()
const route = useRoute()

const { $t, $tO } = useValaxyI18n()
const authorLink = siteConfig.value.author.link?.trim()
const description = $tO(frontmatter.value.description) || route.meta.seoDescription || ''
const frontmatterImage = typeof frontmatter.value.image === 'string' ? frontmatter.value.image : undefined
const image = pickShareImage([frontmatter.value.ogImage, frontmatterImage, frontmatter.value.cover])
const pageUrl = /^https?:\/\//.test(siteConfig.value.url)
  ? resolveSiteUrl(siteConfig.value.url, route.path)
  : ''
const article: Parameters<typeof defineArticle>[0] = {
  '@type': 'BlogPosting',
  'headline': $tO(frontmatter.value.title),
  ...(description ? { description } : {}),
  'author': [
    {
      name: $t(siteConfig.value.author.name),
      ...(authorLink ? { url: authorLink } : {}),
    },
  ],
  'datePublished': dayjs(frontmatter.value.date || '').toDate(),
  'dateModified': dayjs(frontmatter.value.updated || '').toDate(),
  ...(pageUrl ? { url: pageUrl } : {}),
  ...(image ? { image: resolveShareImage(siteConfig.value.url, route.path, image) } : {}),
}

useSchemaOrg(
  defineArticle(article),
)
</script>

<template>
  <YunLayoutWrapper
    outline-nav
    :local-menu="!!collection"
    :local-menu-open="menuOpen"
    :local-menu-label="t('theme.collectionMenu')"
    local-menu-controls="yun-collection-menu"
    local-menu-kind="collection"
    @toggle-local-menu="toggleMenu"
  >
    <YunLayoutLeft />
    <YunCollectionMobile v-model:open="menuOpen" />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header-after>
          <YunMainHeaderAfter />
        </template>

        <template #main-content-after>
          <YunMainContentAfter />
        </template>

        <template v-if="collection" #main-nav>
          <YunCollectionPrevNext :collection="collection" :current-index="currentIndex" />
        </template>

        <template #aside-custom>
          <slot name="aside-custom" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
