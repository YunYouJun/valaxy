<script lang="ts" setup>
import { computed } from 'vue'
import { useAppStore, useCategories, useFrontmatter, usePostTitle, useSiteStore } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'

const { t } = useI18n()

const app = useAppStore()
const site = useSiteStore()
const frontmatter = useFrontmatter()

const route = useRoute()
const curCategory = computed(() => (route.query.category as string || ''))
const categories = useCategories()

const pageIcon = computed(() => {
  if (!frontmatter.value.icon)
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    frontmatter.value.icon = 'i-ri-folder-2-line'
  return frontmatter.value.icon
})

const posts = computed(() => {
  const list = site.postList.filter((post) => {
    if (post.categories && curCategory.value !== 'Uncategorized') {
      if (typeof post.categories === 'string')
        return post.categories === curCategory.value
      else
        return post.categories.join('/').startsWith(curCategory.value) && post.categories[0] === curCategory.value.split('/')[0]
    }
    if (!post.categories && curCategory.value === 'Uncategorized')
      return post.categories === undefined
    return false
  })
  return list
})

const title = usePostTitle(frontmatter)

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])
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
        <template #main-header>
          <YunPageHeader
            class="mt-8"
            :title="title || t('menu.categories')"
            :icon="pageIcon"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
          />
        </template>
        <template #main-content>
          <div text="center" class="yun-text-light" p="2">
            {{ t('counter.categories', Array.from(categories.children).length) }}
          </div>
          <YunCategories :categories="categories.children" />
          <RouterView />
        </template>

        <template #main-nav-before>
          <YunCard v-if="curCategory" class="post-collapse-container" m="t-4" w="full">
            <YunPageHeader
              m="t-10"
              :title="curCategory === 'Uncategorized' ? t('category.uncategorized') : curCategory.split('/').join(' / ')"
              icon="i-ri-folder-open-line"
            />
            <YunPostCollapse w="full" m="b-4" p="x-20 lt-sm:x-5" :posts="posts" />
          </YunCard>
        </template>
      </component>
    </RouterView>
  </div>

  <YunFooter />
</template>
