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
  if (color.value) {
    return ''
  }
  return props.post.postTitleClass || gradientClasses.value
})
</script>

<template>
  <div class="post-card-link flex-center w-full">
    <YunCard
      class="post-card-wrapper w-full hover:scale-102 hover:z-1"
      mx="4"
      :class="post.cover ? 'post-card-image' : 'post-card'"
      overflow="hidden" v-bind="styles ? { style: styles } : {}"
    >
      <!-- Overlay link covers the entire card -->
      <AppLink class="post-card-overlay" :to="post.path || ''" :aria-label="$tO(post.title)" tabindex="0" />

      <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
        <img
          v-if="post.cover" :src="post.cover" :alt="t('post.cover')" width="320" height="180"
          class="post-card-cover cover object-cover object-center md:shadow" loading="lazy"
        >

        <div class="post-card-body flex flex-col items-center relative" :class="post.cover && 'post-card-body-with-cover'" w="full">
          <AppLink class="post-title-link" :to="post.path || ''" m="t-3" :class="postTitleClass" tabindex="-1">
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
            v-if="post.url" :href="post.url" class="post-link-btn shadow hover:shadow-md" rounded target="_blank"
            rel="noopener noreferrer"
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
</template>

<style lang="scss">
.post-card-wrapper {
  // Stacking context for the overlay
  position: relative;
  transition: box-shadow var(--va-transition-duration), scale var(--va-transition-duration);

  &:hover {
    box-shadow: 0 4px 24px rgb(0 0 0 / 0.08);
  }
}

.post-card-body {
  gap: 0.15rem;
}

.post-card-link {
  // max-w-$yun-post-card-max-width
  max-width: calc(var(--yun-post-card-max-width) + 2rem);
}

// Overlay link covers the entire card as the click target
// Sits above normal content but below interactive elements
.post-card-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;

  &:focus-visible {
    outline: 2px solid var(--va-c-primary);
    outline-offset: 2px;
    border-radius: var(--va-card-border-radius, 0.5rem);
  }
}

// Interactive elements (title, tags, categories, external link) float above the overlay
.post-title-link,
.yun-card-actions,
.post-link-btn {
  position: relative;
  z-index: 2;
}

.post-card-link :hover {
  cursor: var(--cursor-pointer), pointer;
}

.post-card-excerpt-content {
  font-size: 0.875rem;
  line-height: 1.7;
}

.yun-card-actions {
  border-top: 1px solid rgb(122 122 122 / 0.08);
}
</style>
