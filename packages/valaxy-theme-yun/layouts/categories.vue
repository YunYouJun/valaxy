<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useCategory, useFrontmatter, useInvisibleElement, usePostList } from 'valaxy'
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
</script>

<template>
  <YunBase>
    <template #header>
      <YunPageHeader
        :title="frontmatter.title || t('menu.categories')"
        :icon="frontmatter.icon || 'i-ri-folder-2-line'"
        :color="frontmatter.color"
      />
    </template>
    <template #content>
      <div text="center" class="yun-text-light" p="2">
        {{ t('counter.categories', categories.children!.size ) }}
      </div>
      <YunCategories :categories="categories.children!" :display-category="displayCategory" />
      <router-view />
    </template>

    <YunCard v-if="curCategory" ref="collapse" m="t-4" w="full">
      <YunPageHeader m="t-4" :title="curCategory" icon="i-ri-folder-open-line" />
      <YunPostCollapse w="full" m="b-4" p="x-20 lt-sm:x-5" :posts="posts" />
    </YunCard>
  </YunBase>
</template>
