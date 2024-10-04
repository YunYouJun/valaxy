<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'
import { useAppStore, useFrontmatter, usePostTitle, useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useYunAppStore } from '../stores'

const { t } = useI18n()

const app = useAppStore()
const yun = useYunAppStore()

const frontmatter = useFrontmatter()

const title = usePostTitle(frontmatter)
const site = useSiteStore()

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
</script>

<template>
  <div
    flex="~"
    class="mt-24 md:mt-36 w-full max-w-screen-2xl m-auto justify-center items-start gap-4"
    :class="{
      'flex-col': app.isMobile,
    }"
  >
    <YunSidebarCard v-if="yun.size.isLg" />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            class="mt-8"
            :title="title || t('menu.archives')"
            :icon="pageIcon"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
          />
        </template>
        <template #main-content>
          <RouterView />
          <YunPostCollapse :posts="site.postList" />
        </template>
      </component>
    </RouterView>
  </div>

  <YunFooter />
</template>
