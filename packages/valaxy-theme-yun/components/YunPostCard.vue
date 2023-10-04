<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { Post } from 'valaxy'
import type { StyleValue } from 'vue'
import { usePostProperty } from '../composables'

const props = defineProps<{
  post: Post
}>()

const { t } = useI18n()

const { icon, styles } = usePostProperty(props.post.type)
</script>

<template>
  <YunCard m="y-4 auto" :class="post.cover ? 'post-card-image' : 'post-card'" overflow="hidden" :style="styles as StyleValue">
    <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
      <img
        v-if="post.cover"
        :src="post.cover"
        :alt="t('post.cover')"
        width="320" height="180"
        w="40%" h="54"
        class="cover object-cover object-center md:shadow"
      >

      <div class="flex flex-col items-center justify-center" :class="post.cover && 'h-54'" w="full">
        <AppLink
          class="post-title-link cursor-pointer"
          :to="post.path || ''"
          m="t-3"
        >
          <div class="flex-center title text-2xl" text="center" font="serif black">
            <div v-if="post.type" class="inline-flex" m="r-1" :class="icon" />{{ post.title }}
          </div>
        </AppLink>

        <YunPostMeta :frontmatter="post" />

        <div class="flex flex-grow" justify="center" items="center">
          <div v-if="post.excerpt_type === 'text'" py="1" />
          <div v-if="post.excerpt" class="markdown-body" op="80" text="left" w="full" p="x-6 lt-sm:4 y-2" v-html="post.excerpt" />
          <div v-else m="b-5" />
        </div>

        <!-- <div m="b-5" /> -->

        <a
          v-if="post.url"
          :href="post.url"
          class="post-link-btn shadow hover:shadow-md"
          rounded
          target="_blank"
          m="b-4"
        >
          {{ t('post.view_link') }}
        </a>
      </div>
    </div>

    <!-- always show -->
    <div
      w="full" class="yun-card-actions flex justify-between"
      min-h="10"
      border="t" text="sm"
    >
      <div class="post-categories inline-flex" flex="wrap 1" items="center">
        <YunPostCategories m="l-1" :categories="post.categories" />
      </div>

      <div
        class="post-tags inline-flex" items="center"
        flex="wrap 1" justify="end" m="1"
      >
        <template v-if="post.tags">
          <YunPostTags :tags="post.tags" />
        </template>
      </div>
    </div>
  </YunCard>
</template>
