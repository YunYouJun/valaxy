<script lang="ts" setup>
import type { Post } from 'valaxy'
import { usePostCollections, useValaxyI18n } from 'valaxy'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePostProperty } from '../composables'

const props = defineProps<{
  post: Post
}>()

const { t } = useI18n()
const { $tO } = useValaxyI18n()

const { icon, styles, color } = usePostProperty(props.post.type)

const postCollections = usePostCollections(computed(() => props.post.path || ''))

const gradientClasses = ref('bg-gradient-to-r gradient-text from-$va-c-primary to-$va-c-primary-lighter')
const postTitleClass = computed(() => {
  if (color) {
    return ''
  }
  return props.post.postTitleClass || gradientClasses.value
})
</script>

<template>
  <RouterLink v-slot="{ navigate }" :to="post.path || ''" custom>
    <div class="post-card-link flex-center w-full" role="link" tabindex="0" @click="navigate" @keydown.enter="() => navigate()" @keydown.space.prevent="() => navigate()">
      <YunCard
        class="post-card-wrapper w-full hover:scale-102 hover:z-1"
        mx="4"
        :class="post.cover ? 'post-card-image' : 'post-card'"
        overflow="hidden" v-bind="styles ? { style: styles } : {}"
      >
        <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
          <img
            v-if="post.cover" :src="post.cover" :alt="t('post.cover')" width="320" height="180" w="40%" h="54"
            class="cover object-cover object-center md:shadow" loading="lazy"
          >

          <div class="post-card-body flex flex-col items-center relative" :class="post.cover && 'h-54'" w="full">
            <AppLink class="post-title-link cursor-pointer" :to="post.path || ''" m="t-3" :class="postTitleClass">
              <div class="post-card-title flex-center title text-2xl" text="center" font="serif black">
                <div v-if="post.type" class="inline-flex" m="r-1" :class="icon" />
                <span>{{ $tO(post.title) }}</span>
              </div>
            </AppLink>

            <YunPostMeta :frontmatter="post" />

            <div class="post-card-excerpt" flex="~ grow col" w="full" justify="center" items="center">
              <div v-if="post.excerpt_type === 'text'" py="1" />
              <template v-if="post.excerpt">
                <div
                  v-if="post.excerpt_type === 'html'"
                  class="post-card-excerpt-content markdown-body" op="90" text="left" w="full" p="x-6 y-2"
                >
                  <ValaxyDynamicComponent :template-str="post.excerpt" />
                </div>
                <div
                  v-else
                  class="post-card-excerpt-content markdown-body" op="90" text="left" w="full" p="x-6 y-2"
                  v-html="post.excerpt"
                />
              </template>
              <div v-else m="b-5" />
            </div>

            <YunExcerptBottomGradient v-if="post.excerpt" />

            <a
              v-if="post.url" :href="post.url" class="post-link-btn shadow hover:shadow-md z-2" rounded target="_blank"
              m="b-4"
            >
              {{ t('post.view_link') }}
            </a>
          </div>
        </div>

        <!-- always show -->
        <div w="full" class="yun-card-actions flex items-center justify-between" p="x-4 y-2" text="sm">
          <div class="post-categories inline-flex gap-2" flex="wrap 1" items="center">
            <YunPostCategories :categories="post.categories" />
            <YunPostCollectionBadge v-if="postCollections.length" :collections="postCollections" />
          </div>

          <YunPostTags v-if="post.tags" m="l-2" :tags="post.tags" />
        </div>
      </YunCard>
    </div>
  </RouterLink>
</template>

<style lang="scss">
.post-card-wrapper {
  transition: box-shadow var(--va-transition-duration), scale var(--va-transition-duration);

  &:hover {
    box-shadow: 0 4px 24px rgb(0 0 0 / 0.08);
  }
}

.post-card-body {
  gap: 0.15rem;
}

.post-card {
  // safari not support
  // animation: card-appear 0.6s ease-in-out forwards, card-appear 0.6s ease-in-out forwards reverse;
  // animation-timeline: view();
  // animation-range: entry, exit;
}

.post-card-link {
  text-decoration: none;
  color: inherit;
  // max-w-$yun-post-card-max-width
  max-width: calc(var(--yun-post-card-max-width) + 2rem);

  &:hover {
    text-decoration: none;
    color: inherit;
  }

  &:visited {
    color: inherit;
  }

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid var(--va-c-primary);
    outline-offset: 2px;
    border-radius: var(--va-card-border-radius, 0.5rem);
  }
}

.post-card-link :hover {
  cursor: var(--cursor-pointer), pointer;
}

.post-card-excerpt-content {
  font-size: 0.875rem;
  line-height: 1.7;
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
  border-top: 1px solid rgb(122 122 122 / 0.08);
}
</style>
