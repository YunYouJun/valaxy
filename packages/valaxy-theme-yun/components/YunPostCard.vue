<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { Post } from 'valaxy'
import { usePostProperty } from '../composables'

const props = defineProps<{
  post: Post
}>()

const { t } = useI18n()

const { icon, styles } = usePostProperty(props.post.type)
</script>

<template>
  <YunCard m="y-4 auto" :class="post.cover ? 'post-card-image' : 'post-card'" :style="styles">
    <div class="flex flex-1 of-hidden justify-start items-start post-card-info" w="full">
      <img
        v-if="post.cover"
        :src="post.cover"
        :alt="t('post.cover')"
        width="320" height="180"
        w="40%" h="54"
        class="cover object-cover object-center md:shadow"
      >

      <div class="flex flex-col flex-1 items-center" :class="post.cover && 'max-h-54'" w="full">
        <AppLink
          class="post-title-link"
          :to="post.path || ''"
          m="t-3"
        >
          <div class="flex justify-center items-center title text-2xl" font="serif black">
            <div v-if="post.type" class="inline-flex" m="r-1" :class="icon" />{{ post.title }}
          </div>
        </AppLink>

        <YunPostMeta :frontmatter="post" />

        <div v-if="post.excerpt" class="markdown-body" text="left" w="full" p="x-6 lt-sm:4" v-html="post.excerpt" />
        <div m="b-5" />

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
    <div w="full" class="yun-card-actions flex justify-between" border="t" text="sm">
      <div class="inline-flex">
        <router-link
          :to="{
            path: '/categories/',
            query: { category: Array.isArray(post.categories) ? post.categories[post.categories.length - 1] : post.categories },
          }"
          class="post-categories inline-flex justify-center items-center" m="l-2"
        >
          <div m="x-1" i-ri-folder-2-line />
          {{ Array.isArray(post.categories) ? post.categories.join(' > ') : post.categories }}
        </router-link>
      </div>

      <div class="post-tags inline-flex" m="r-2">
        <template v-if="post.tags">
          <router-link v-for="tag, i in post.tags" :key="i" :to="{ path: '/tags/', query: { tag } }" m="x-1" class="post-tag inline-flex justify-center items-center">
            <div m="r-1" i-ri-price-tag-3-line />
            {{ tag }}
          </router-link>
        </template>
      </div>
    </div>
  </YunCard>
</template>
