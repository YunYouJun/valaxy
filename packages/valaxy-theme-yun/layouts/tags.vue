<script lang="ts" setup>
import { useFrontmatter, useInvisibleElement, usePostTitle, useSiteStore } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { defineWebPage, useSchemaOrg } from '@unhead/schema-org'
import { useThemeConfig, useYunTags } from '../composables'

useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
  }),
])

const route = useRoute()
const router = useRouter()

const themeConfig = useThemeConfig()

const { t } = useI18n()
const frontmatter = useFrontmatter()
const { tags, getTagStyle } = useYunTags({
  primary: themeConfig.value.colors.primary,
})

const curTag = computed(() => route.query.tag as string || '')
const site = useSiteStore()

const posts = computed(() => {
  const list = site.postList.filter((post) => {
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

function displayTag(tag: string) {
  router.push({
    query: {
      tag,
    },
  })

  show()
}

const title = usePostTitle(frontmatter)

// use flex to fix `overflow-wrap: break-words;` not working in Safari
</script>

<template>
  <YunLayoutWrapper>
    <YunLayoutLeft />

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-header>
          <YunPageHeader
            class="mt-8"
            :title="title || t('menu.tags')"
            :icon="frontmatter.icon || 'i-ri-tag-line'"
            :color="frontmatter.color"
            :page-title-class="frontmatter.pageTitleClass"
          />
        </template>
        <template #main-content>
          <div class="yun-text-light" text="center" p="2">
            {{ t('counter.tags', Array.from(tags).length) }}
          </div>

          <div class="justify-center items-end" flex="~ wrap" gap="1">
            <YunLayoutPostTag
              v-for="[key, tag] in Array.from(tags).sort()"
              :key="key"
              :title="key"
              :count="tag.count"
              :style="getTagStyle(tag.count)"
              @click="displayTag(key.toString())"
            />
          </div>

          <RouterView />
        </template>

        <template #main-nav-before>
          <YunCard v-if="curTag" ref="collapse" m="t-4" w="full">
            <YunPageHeader :title="curTag" icon="i-ri-hashtag" />
            <YunPostCollapse w="full" m="b-4" p="x-20 lt-sm:x-5" :posts="posts" />
          </YunCard>
        </template>
      </component>
    </RouterView>

    <YunLayoutRight />
  </YunLayoutWrapper>

  <YunFooter />
</template>
