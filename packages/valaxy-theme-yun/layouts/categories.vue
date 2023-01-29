<script lang="ts" setup>
import { computed } from 'vue'
import { useCategory, useFrontmatter, usePostTitle, useSiteStore } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()

const site = useSiteStore()
const frontmatter = useFrontmatter()

const route = useRoute()
const curCategory = computed(() => (route.query.category as string || ''))
const categories = useCategory()

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
</script>

<template>
  <Layout>
    <template #main-header>
      <YunPageHeader
        :title="title || t('menu.categories')"
        :icon="frontmatter.icon || 'i-ri-folder-2-line'"
        :color="frontmatter.color"
      />
    </template>
    <template #main-content>
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.categories', categories.children.length) }}
      </div>
      <YunCategories :categories="categories.children" />
      <router-view />
    </template>

    <template #main-nav-before>
      <YunCard v-if="curCategory" class="post-collapse-container" m="t-4" w="full">
        <YunPageHeader
          :title="curCategory === 'Uncategorized' ? t('category.uncategorized') : curCategory.split('/').join(' / ')"
          icon="i-ri-folder-open-line"
        />
        <YunPostCollapse w="full" m="b-4" p="x-20 lt-sm:x-5" :posts="posts" />
      </YunCard>
    </template>
  </Layout>
</template>
