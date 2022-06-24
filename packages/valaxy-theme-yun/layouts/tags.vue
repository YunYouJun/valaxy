<script lang="ts" setup>
import { useFrontmatter, useInvisibleElement, usePostList, usePostTitle, useTags, useThemeConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const themeConfig = useThemeConfig()

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { tags, getTagStyle } = useTags({
  primary: themeConfig.value.colors.primary,
})

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
const { show } = useInvisibleElement(collapse)

const displayTag = (tag: string) => {
  router.push({
    query: {
      tag,
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
        :title="title || t('menu.tags')"
        :icon="frontmatter.icon || 'i-ri-tag-line'"
        :color="frontmatter.color"
      />
    </template>
    <template #main-content>
      <div class="yun-text-light" text="center" p="2">
        {{ t('counter.tags', Array.from(tags).length) }}
      </div>

      <div text="center">
        <span v-for="[key, tag] in Array.from(tags).sort()" :key="key" class="post-tag cursor-pointer" :style="getTagStyle(tag.count)" p="1" @click="displayTag(key.toString())">
          #{{ key }}<span text="xs">[{{ tag.count }}]</span>
        </span>
      </div>

      <router-view />
    </template>

    <template #main-nav-before>
      <YunCard v-if="curTag" ref="collapse" m="t-4" w="full">
        <YunPageHeader :title="curTag" icon="i-ri-hashtag" />
        <YunPostCollapse w="full" m="b-4" p="x-20 lt-sm:x-5" :posts="posts" />
      </YunCard>
    </template>
  </Base>
</template>

<style lang="scss">
.post-tag {
  color: var(--yun-tag-color);

  &:hover {
    color: var(--va-c-primary);
  }
}
</style>
