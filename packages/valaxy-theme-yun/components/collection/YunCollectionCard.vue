<script setup lang="ts">
import type { CollectionConfig, Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveCategoryPath } from '../../utils'

const props = defineProps<{
  post: Post
  collection: CollectionConfig
}>()

const { t } = useI18n()
const { $tO } = useValaxyI18n()

const cover = computed(() => props.post.cover || props.collection.cover)
const title = computed(() => props.post.title || props.collection.title)
const itemCount = computed(() => props.collection.items?.length ?? 0)
const categories = computed(() => props.post.categories?.length ? props.post.categories : props.collection.categories)
const tags = computed(() => props.post.tags?.length ? props.post.tags : props.collection.tags)
const hasCategories = computed(() => Boolean(resolveCategoryPath(categories.value)))
const hasTags = computed(() => Boolean(tags.value?.length))
const hasActions = computed(() => hasCategories.value || hasTags.value)

/**
 * Preview up to 3 items from the collection
 */
const previewItems = computed(() => {
  if (!props.collection.items?.length)
    return []
  return props.collection.items.slice(0, 3)
})
const hasMoreItems = computed(() => itemCount.value > 3)
</script>

<template>
  <RouterLink class="post-card-link flex-center w-full" :to="post.path || ''">
    <YunCard
      class="collection-card w-full"
      mx="4"
      :class="cover ? 'post-card-image' : 'post-card'"
      overflow="hidden"
    >
      <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
        <img
          v-if="cover"
          :src="cover"
          :alt="$tO(title)"
          width="320" height="180"
          class="post-card-cover cover object-cover object-center md:shadow"
          loading="lazy"
        >

        <div class="collection-card-body flex flex-col items-center relative" :class="cover && 'post-card-body-with-cover'" w="full">
          <!-- Meta: type badge (above title, independent line) -->
          <div class="collection-card-badge">
            <span i-ri-book-2-line />
            <span>{{ t('collection.badge') }}</span>
          </div>

          <!-- Title + item count -->
          <div class="collection-card-title">
            <span class="collection-card-title-text">{{ $tO(title) }}</span>
            <span v-if="itemCount" class="collection-card-count">({{ itemCount }})</span>
          </div>

          <!-- Description -->
          <div v-if="collection.description" class="collection-card-desc">
            {{ $tO(collection.description) }}
          </div>

          <!-- Items preview -->
          <div v-if="previewItems.length" class="collection-card-items">
            <div v-for="item in previewItems" :key="item.key || item.title" class="collection-card-item">
              <div class="collection-card-item-dot" />
              <span>{{ $tO(item.title) }}</span>
            </div>
            <div v-if="hasMoreItems" class="collection-card-item collection-card-item-more">
              <span>···</span>
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="collection-card-empty">
            <div i-ri-draft-line />
            <span>{{ t('collection.empty') }}</span>
          </div>

          <div flex="~ grow col" w="full" />
        </div>
      </div>

      <div v-if="hasActions" w="full" class="yun-card-actions flex justify-between p-4" min-h="10" text="sm">
        <div class="post-categories inline-flex" flex="wrap 1" items="center">
          <YunPostCategories m="l-1" :categories="categories" />
        </div>
        <YunPostTags v-if="hasTags" m="1" :tags="tags!" />
      </div>
    </YunCard>
  </RouterLink>
</template>

<style lang="scss">
.collection-card {
  --yun-collection-accent: var(--va-c-link);
  --yun-feed-card-leading-width: 3px;
  --yun-feed-card-leading-color: color-mix(in srgb, var(--yun-collection-accent) 78%, transparent);
  --yun-feed-card-leading-hover-color: var(--yun-collection-accent);
}

.collection-card-body {
  padding: 0.75rem 1rem;
  gap: 0.35rem;
  color: var(--va-c-text-2);
}

.collection-card-badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--yun-collection-accent);
}

.collection-card-title {
  align-self: flex-start;
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;

  .collection-card-title-text {
    font-size: 1.25rem;
    font-weight: var(--yun-post-title-font-weight, 700);
    font-family: var(--yun-post-title-font-family, var(--va-font-serif));
    color: var(--yun-post-title-color, var(--va-c-text));
    line-height: 1.4;

    @media (hover: hover) and (pointer: fine) {
      .post-card-link:hover & {
        color: var(--yun-post-title-hover-color, var(--va-c-link));
      }
    }
  }
}

.collection-card-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--va-c-text-2);
}

.collection-card-desc {
  align-self: flex-start;
  font-size: 0.8rem;
  color: var(--yun-post-excerpt-color, var(--va-c-text-1));
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.collection-card-items {
  align-self: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.6rem;
  margin-top: 0.2rem;
}

.collection-card-item {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  line-height: 1.6;
}

.collection-card-item-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--yun-collection-accent);
  opacity: 0.75;
  flex-shrink: 0;
}

.collection-card-item-more {
  letter-spacing: 0.1em;
}

.collection-card-empty {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  margin-top: 0.2rem;
  font-style: italic;
}
</style>
