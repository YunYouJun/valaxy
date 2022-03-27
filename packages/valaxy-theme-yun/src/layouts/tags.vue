<script lang="ts" setup>
import { useFrontmatter, usePostList, useTags } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useElementBounding, useIntersectionObserver } from '@vueuse/core'
import Base from './base.vue'

const route = useRoute()
const router = useRouter()

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { tags, getTagStyle } = useTags()

const postList = usePostList()
const curTag = computed(() => route.query.tag as string || '')

const posts = computed(() => {
  const list = postList.value.filter((post) => {
    if (post.tags) {
      if (typeof post.tags === 'string')
        return post.tags === curTag.value
      else
        return post.tags.includes(curTag.value)
    }
    return false
  })
  return list
})

const collapse = ref()
const collapseIsVisible = ref(false)
const { top } = useElementBounding(collapse)
useIntersectionObserver(collapse, ([{ isIntersecting }]) => {
  collapseIsVisible.value = isIntersecting
})

const displayTag = (tag: string) => {
  router.push({
    query: {
      tag,
    },
  })

  // scroll when collapse is not visible
  if (!collapseIsVisible.value)
    window.scrollTo(0, top.value)
}

</script>

<template>
  <Base>
    <template #content>
      <YunPageHeader
        :title="frontmatter.title || t('menu.tags')"
        :icon="frontmatter.icon || 'i-ri-tag-line'"
        :color="frontmatter.color"
      />

      <div class="yun-text-light" text="center" p="2">
        {{ t('counter.tags', Array.from(tags).length) }}
      </div>

      <div text="center">
        <span v-for="[key, tag] in Array.from(tags).sort()" :key="key" class="post-tag cursor-pointer" :style="getTagStyle(tag.count)" m="1" @click="displayTag(key.toString())">
          #{{ key }}<span text="xs">[{{ tag.count }}]</span>
        </span>
      </div>

      <router-view />
    </template>

    <YunCard v-if="curTag" ref="collapse" m="t-4" w="full">
      <YunPostCollapse w="full" m="t-4" p="x-20 lt-sm:x-5" :posts="posts" />
    </YunCard>
  </Base>
</template>

<style lang="scss">
.post-tag {
  color: var(--yun-tag-color);

  &:hover {
    color: var(--yun-c-primary);
  }
}
</style>
