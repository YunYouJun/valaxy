<script lang="ts" setup>
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'
import { useFrontmatter, usePostTitle, useSiteStore } from 'valaxy'
import { computed } from 'vue'
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

const pageIcon = computed(() => {
  if (!frontmatter.value.icon)
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    frontmatter.value.icon = 'i-ri-archive-line'
  return frontmatter.value.icon
})
</script>

<template>
  <YunLayoutWrapper>
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
          <YunPostCollapse :posts="site.postList" />
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>

  <YunFooter />
</template>
