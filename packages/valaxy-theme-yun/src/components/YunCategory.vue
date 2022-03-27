<script lang="ts" setup>
import { ref } from 'vue'
import type { Categories, Post } from 'valaxy'

defineProps<{
  name: string
  // to eliminate the warning
  category: Map<string, Categories | Post[]> | Post []
  level?: number
}>()

const showChild = ref(false)
</script>

<template>
  <li class="category-list-item inline-flex items-center cursor-pointer" @click="showChild = !showChild">
    <div v-if="!showChild" class="inline-flex" i-ri-folder-add-line />
    <div v-else class="inline-flex" style="color:var(--yun-c-primary)" i-ri-folder-reduce-line />
    <span m="l-1">
      {{ name }} [ ]
    </span>
  </li>

  <template v-if="showChild">
    <ul v-if="Array.isArray(category)">
      <li v-for="post, i in category" :key="i" class="post-list-item" m="l-4">
        <router-link v-if="post.title" :to="post.path" class="inline-flex items-center">
          <div i-ri-file-text-line />
          <span m="l-1" font="serif black">{{ post.title }}</span>
        </router-link>
      </li>
    </ul>
    <YunCategories v-else :categories="category" />
  </template>
</template>
