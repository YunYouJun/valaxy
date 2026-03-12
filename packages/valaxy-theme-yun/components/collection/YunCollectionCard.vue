<script setup lang="ts">
import type { CollectionConfig, Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  post: Post
  collection: CollectionConfig
}>()

const { t } = useI18n()
const { $tO } = useValaxyI18n()

const cover = computed(() => props.post.cover || props.collection.cover)
const title = computed(() => props.post.title || props.collection.title)
const itemCount = computed(() => props.collection.items?.length ?? 0)

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
      class="collection-card w-full hover:scale-102 hover:z-1"
      mx="4"
      :class="cover ? 'post-card-image' : 'post-card'"
      overflow="hidden"
    >
      <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
        <img
          v-if="cover"
          :src="cover"
          :alt="$tO(title)"
          width="320" height="180" w="40%" h="54"
          class="cover object-cover object-center md:shadow"
          loading="lazy"
        >

        <div class="collection-card-body flex flex-col items-center relative" :class="cover && 'h-54'" w="full">
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

      <div w="full" class="yun-card-actions flex justify-between p-4" min-h="10" text="sm">
        <div class="post-categories inline-flex" flex="wrap 1" items="center">
          <YunPostCategories v-if="post.categories || collection.categories" m="l-1" :categories="(post.categories || collection.categories)!" />
        </div>
        <YunPostTags v-if="post.tags || collection.tags" m="1" :tags="(post.tags || collection.tags)!" />
      </div>
    </YunCard>
  </RouterLink>
</template>

<style lang="scss">
.collection-card {
  --collection-accent: var(--va-c-primary);
  --collection-accent-light: var(--va-c-primary-lighter, var(--va-c-primary));

  border-left: 3px solid var(--collection-accent);
  transition: border-color var(--va-transition-duration), box-shadow var(--va-transition-duration), scale var(--va-transition-duration);

  &:hover {
    border-left-color: var(--collection-accent-light);
    box-shadow: 0 4px 24px rgb(0 0 0 / 0.08);
  }
}

.collection-card-body {
  padding: 0.75rem 1rem;
  gap: 0.35rem;
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
  color: var(--collection-accent);
  opacity: 0.55;
}

.collection-card-title {
  align-self: flex-start;
  display: inline-flex;
  align-items: baseline;
  gap: 0.3rem;

  .collection-card-title-text {
    font-size: 1.25rem;
    font-weight: 800;
    font-family: var(--va-font-serif);
    background: linear-gradient(135deg, var(--collection-accent), var(--collection-accent-light));
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.4;
  }
}

.collection-card-count {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--collection-accent);
  opacity: 0.5;
}

.collection-card-desc {
  align-self: flex-start;
  font-size: 0.8rem;
  opacity: 0.6;
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
  opacity: 0.5;
  line-height: 1.6;
  transition: opacity var(--va-transition-duration-fast);

  .collection-card:hover & {
    opacity: 0.7;
  }
}

.collection-card-item-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--collection-accent);
  opacity: 0.6;
  flex-shrink: 0;
}

.collection-card-item-more {
  letter-spacing: 0.1em;
  color: var(--collection-accent);
  opacity: 0.4;
}

.collection-card-empty {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  opacity: 0.35;
  margin-top: 0.2rem;
  font-style: italic;
}
</style>
