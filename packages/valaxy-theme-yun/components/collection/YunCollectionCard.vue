<script setup lang="ts">
import type { CollectionConfig, Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  post: Post
  collection: CollectionConfig
}>()

const { $tO } = useValaxyI18n()
</script>

<template>
  <RouterLink class="post-card-link flex-center w-full" :to="post.path || ''">
    <YunCard
      class="w-full hover:scale-102 hover:z-1"
      mx="4"
      :class="collection.cover ? 'post-card-image' : 'post-card'"
      overflow="hidden"
    >
      <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
        <img
          v-if="collection.cover"
          :src="collection.cover"
          :alt="$tO(collection.title)"
          width="320" height="180" w="40%" h="54"
          class="cover object-cover object-center md:shadow"
          loading="lazy"
        >

        <div class="flex flex-col items-center relative" :class="collection.cover && 'h-54'" w="full">
          <div class="mt-3 mb-1 inline-flex items-center gap-1 text-xs op-60 bg-$va-c-primary/10 text-$va-c-primary px-2 py-0.5 rounded">
            <div i-ri-book-2-line />
            <span>{{ $tO(collection.title) }}</span>
            <span v-if="collection.items">({{ collection.items.length }})</span>
          </div>

          <div v-if="collection.description" class="text-sm op-60 mt-2 px-4 text-center">
            {{ $tO(collection.description) }}
          </div>

          <div flex="~ grow col" w="full" justify="center" items="center">
            <div m="b-5" />
          </div>
        </div>
      </div>

      <div w="full" class="yun-card-actions flex justify-between p-4" min-h="10" text="sm">
        <div class="post-categories inline-flex" flex="wrap 1" items="center">
          <YunPostCategories v-if="collection.categories" m="l-1" :categories="collection.categories" />
        </div>
        <YunPostTags v-if="collection.tags" m="1" :tags="collection.tags" />
      </div>
    </YunCard>
  </RouterLink>
</template>
