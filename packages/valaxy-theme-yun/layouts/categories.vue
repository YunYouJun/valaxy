<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useCategory, useFrontmatter, useInvisibleElement, usePostList, usePostTitle } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const categories = useCategory()

const route = useRoute()
const curCategory = computed(() => (route.query.category as string || ''))

const postList = usePostList()
const posts = computed(() => {
  const list = postList.value.filter((post) => {
    if (post.categories && curCategory.value !== 'Uncategorized') {
      if (typeof post.categories === 'string')
        return post.categories === curCategory.value
      else
        return post.categories.includes(curCategory.value)
    }
    if (!post.categories && curCategory.value === 'Uncategorized')
      return post.categories === undefined
    return false
  })
  return list
})

const collapse = ref()
const { show } = useInvisibleElement(collapse)

const router = useRouter()
const displayCategory = (category: string) => {
  router.push({
    query: {
      category,
    },
  })

  show()
}

const title = usePostTitle(frontmatter)
</script>

<template>
  <Base>
    <template #main-header>
      <YunPageHeader
        :title="title || t('menu.categories')"
        :icon="frontmatter.icon || 'i-ri-folder-2-line'"
        :color="frontmatter.color"
      />
    </template>
    <template #main-content>
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.categories', categories.children!.size) }}
      </div>
      <YunCategories :categories="categories.children!" :display-category="displayCategory" />
      <router-view />
    </template>

    <template #main-content-after>
      <YunCard v-if="curCategory" ref="collapse" m="t-4" w="full">
        <YunPageHeader :title="curCategory === 'Uncategorized' ? t('category.uncategorized') : curCategory" icon="i-ri-folder-open-line" />
        <YunPostCollapse w="full" m="b-4" p="x-20 lt-sm:x-5" :posts="posts" />
      </YunCard>
    </template>
  </Base>
</template>
