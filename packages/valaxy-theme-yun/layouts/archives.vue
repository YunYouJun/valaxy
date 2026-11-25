<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org/vue'
import { useMediaQuery } from '@vueuse/core'
import { useFrontmatter, usePostListWithCollections, usePostTitle, useSiteConfig } from 'valaxy'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useArchiveYearNav } from '../composables'
import { groupPostsByYear } from '../utils'

const { t } = useI18n()

const siteConfig = useSiteConfig()
const frontmatter = useFrontmatter()

const title = usePostTitle(frontmatter)
const postsWithCollections = usePostListWithCollections()
const isDesc = ref(true)

const yearSummary = computed(() =>
  groupPostsByYear(postsWithCollections.value, siteConfig.value.orderBy, isDesc.value, siteConfig.value.timezone)
    .map(group => ({ year: group.year, count: group.posts.length })),
)

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])

const pageIcon = computed(() => {
  if (!frontmatter.value.icon)
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    frontmatter.value.icon = 'i-ri-archive-line'
  return frontmatter.value.icon
})
const showYearNav = computed(() => frontmatter.value.aside !== false && yearSummary.value.length > 1)
const isDesktop = useMediaQuery('(min-width: 1280px)', { ssrWidth: 1280 })
const { activeYear, scrollToYear } = useArchiveYearNav(yearSummary, showYearNav)
</script>

<template>
  <YunLayoutWrapper outline-nav>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            :title="title || t('menu.archives')"
            :icon="pageIcon"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
          />
        </template>
        <template #main-content>
          <RouterView />
          <YunPostCollapse
            v-model:desc="isDesc"
            :posts="postsWithCollections"
            :active-year="activeYear"
            :show-year-pills="showYearNav"
            @select-year="scrollToYear"
          />
        </template>
      </component>
    </RouterView>

    <YunArchivesYearNav
      v-if="showYearNav && isDesktop"
      :active-year="activeYear"
      :years="yearSummary"
      @select-year="scrollToYear"
    />
    <YunLayoutRight v-else :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
