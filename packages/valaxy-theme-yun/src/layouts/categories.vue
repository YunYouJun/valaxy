<script lang="ts" setup>
import { computed } from '@vue/reactivity'
import { useCategory, useFrontmatter, usePostList } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import Base from './base.vue'

const { t } = useI18n()

const frontmatter = useFrontmatter()
const categories = useCategory()

const route = useRoute()
const curCategory = computed(() => (route.query.category as string || ''))

const postList = usePostList()
const posts = computed(() => {
  const list = postList.value.filter((post) => {
    if (post.categories) {
      if (typeof post.categories === 'string')
        return post.categories === curCategory.value
      else
        return post.categories.includes(curCategory.value)
    }
    return false
  })
  return list
})
</script>

<template>
  <Base>
    <template #content>
      <YunPageHeader
        :title="frontmatter.title || t('menu.categories')"
        :icon="frontmatter.icon || 'i-ri-folder-2-line'"
        :color="frontmatter.color"
      />
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.categories', Array.from(categories).length) }}
      </div>
      <YunCategories :categories="categories" />
      <router-view />
    </template>

    <YunCard v-if="curCategory" m="t-4" w="full">
      <YunPostCollapse w="full" m="t-4" p="x-20 lt-sm:x-5" :posts="posts" />
    </YunCard>
  </Base>
</template>
