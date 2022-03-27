<script lang="ts" setup>
import { useFrontmatter, usePostList, useTag } from 'valaxy'
import { TinyColor } from '@ctrl/tinycolor'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Base from './base.vue'

const frontmatter = useFrontmatter()

const tags = useTag()

const gray = new TinyColor('#999999')
const primaryColor = new TinyColor(getComputedStyle(document.documentElement).getPropertyValue('--yun-c-primary'))

const getTagStyle = (count: number) => {
  const counts = Array.from(tags).map(([_, value]) => value.count)
  const max = Math.max(...counts)
  const min = Math.min(...counts)
  const range = max - min
  const percent = (count - min) / range
  return {
    '--yun-tag-color': gray.mix(primaryColor, percent * 100).toString(),
    'fontSize': `${percent * 36 + 12}px`,
  }
}

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const postList = usePostList()
const curTag = ref(route.query.tag as string || '')

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

const displayTag = (tag: string) => {
  router.push({
    query: {
      tag,
    },
  })
  curTag.value = tag
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

      <YunPostCollapse v-if="curTag" m="t-4" :posts="posts" />
    </template>
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
