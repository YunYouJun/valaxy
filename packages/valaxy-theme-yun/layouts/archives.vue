<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'
import { useFrontmatter, usePostTitle, useSiteStore } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const frontmatter = useFrontmatter()

const title = usePostTitle(frontmatter)
const site = useSiteStore()

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])
</script>

<template>
  <YunSidebar v-if="$slots['sidebar-child']">
    <slot name="sidebar-child" />
  </YunSidebar>
  <YunSidebar v-else />

  <RouterView v-slot="{ Component }">
    <component :is="Component">
      <template #main-header>
        <YunPageHeader
          :title="title || t('menu.archives')"
          :icon="frontmatter.icon || 'i-ri-archive-line'"
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
</template>
