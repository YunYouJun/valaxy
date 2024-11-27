<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { usePostProperty } from '../composables'

const props = defineProps<{
  post: Post
}>()

const { t } = useI18n()

const { icon, styles } = usePostProperty(props.post.type)
</script>

<template>
  <YunCard
    class="w-full"
    m="auto"
    :class="post.cover ? 'post-card-image' : 'post-card'"
    overflow="hidden" :style="styles"
  >
    <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
      <img
        v-if="post.cover"
        :src="post.cover"
        :alt="t('post.cover')"
        width="320" height="180"
        w="40%" h="54"
        class="cover object-cover object-center md:shadow"
        loading="lazy"
      >

      <div class="flex flex-col items-center relative" :class="post.cover && 'h-54'" w="full">
        <AppLink
          class="post-title-link cursor-pointer"
          :to="post.path || ''"
          m="t-3"
          :class="post.postTitleClass"
        >
          <div class="flex-center title text-2xl" text="center" font="serif black">
            <div v-if="post.type" class="inline-flex" m="r-1" :class="icon" />
            <span>{{ post.title }}</span>
          </div>
        </AppLink>

        <YunPostMeta :frontmatter="post" />

        <div flex="~ grow col" w="full" justify="center" items="center">
          <div v-if="post.excerpt_type === 'text'" py="1" />
          <div v-if="post.excerpt" class="markdown-body" op="90" text="left" w="full" p="x-6 lt-sm:4 y-2" v-html="post.excerpt" />
          <div v-else m="b-5" />
        </div>
        <!-- <div m="b-5" /> -->

        <YunExcerptBottomGradient v-if="post.excerpt" />

        <a
          v-if="post.url"
          :href="post.url"
          class="post-link-btn shadow hover:shadow-md z-2"
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
      text="sm"
    >
      <div class="post-categories inline-flex" flex="wrap 1" items="center">
        <YunPostCategories m="l-1" :categories="post.categories" />
      </div>

      <YunPostTags v-if="post.tags" m="1" :tags="post.tags" />
    </div>
  </YunCard>
</template>

<style lang="scss">
.post-card {
  // safari not support
  // animation: card-appear 0.6s ease-in-out forwards, card-appear 0.6s ease-in-out forwards reverse;
  // animation-timeline: view();
  // animation-range: entry, exit;
}

@keyframes card-appear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.yun-card-actions {
  border-top: 1px solid rgb(122 122 122 / 0.05);
}
</style>
