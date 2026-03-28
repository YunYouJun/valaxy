<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { postList } from '../stores/app'

const { t } = useI18n()

interface TagInfo {
  name: string
  count: number
}

const allTags = computed(() => {
  const tagMap = new Map<string, number>()
  for (const post of postList.value.posts) {
    const tags = post.frontmatter.tags
    if (!tags || !Array.isArray(tags))
      continue
    for (const tag of tags) {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
    }
  }
  return Array.from(tagMap.entries())
    .map(([name, count]): TagInfo => ({ name, count }))
    .sort((a, b) => b.count - a.count)
})

const selectedTags = ref<Set<string>>(new Set())

function toggleTag(tag: string) {
  const next = new Set(selectedTags.value)
  if (next.has(tag))
    next.delete(tag)
  else
    next.add(tag)
  selectedTags.value = next
}

function isTagSelected(tag: string) {
  return selectedTags.value.has(tag)
}

function clearSelection() {
  selectedTags.value = new Set()
}

const filteredPosts = computed(() => {
  if (selectedTags.value.size === 0)
    return postList.value.posts

  return postList.value.posts.filter((post) => {
    const tags = post.frontmatter.tags
    if (!tags || !Array.isArray(tags))
      return false
    return Array.from(selectedTags.value).some(t => tags.includes(t))
  })
})
</script>

<template>
  <Splitpanes class="h-full">
    <Pane min-size="20" size="33">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('tags.title') }}
          </h3>
          <span class="text-xs op-50 tabular-nums">{{ allTags.length }}</span>
        </div>

        <div v-if="selectedTags.size > 0" class="flex items-center gap-1 px-3 py-1.5 border-b border-gray-100 dark:border-gray-800 flex-wrap">
          <span class="text-xs op-50">{{ t('tags.selected') }}:</span>
          <span
            v-for="tag in selectedTags" :key="tag"
            class="inline-flex items-center gap-0.5 text-xs bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-1.5 py-0.5 rounded"
          >
            {{ tag }}
            <button class="i-ri:close-line text-xs op-50 hover:op-100 cursor-pointer" @click="toggleTag(tag)" />
          </span>
          <button class="text-xs op-40 hover:op-70 cursor-pointer ml-1" @click="clearSelection">
            {{ t('batchEdit.deselect_all') }}
          </button>
        </div>

        <div class="flex-1 overflow-auto p-3">
          <div v-if="allTags.length > 0" class="flex flex-wrap gap-1.5">
            <button
              v-for="tag in allTags" :key="tag.name"
              class="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer transition-colors border"
              :class="isTagSelected(tag.name)
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
              "
              @click="toggleTag(tag.name)"
            >
              <span># {{ tag.name }}</span>
              <span class="text-[10px] op-60 tabular-nums">{{ tag.count }}</span>
            </button>
          </div>
          <div v-else class="flex items-center justify-center h-full op-40 text-sm">
            {{ t('tags.empty') }}
          </div>
        </div>
      </div>
    </Pane>

    <Pane>
      <div class="h-full overflow-auto">
        <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold">
            {{ selectedTags.size > 0 ? t('tags.selected') : t('tags.all') }}
          </h3>
          <span class="text-xs op-50">{{ t('categories.posts_count', { count: filteredPosts.length }) }}</span>
        </div>
        <ul v-if="filteredPosts.length > 0" class="px-3 py-2">
          <VDPostListItem v-for="post in filteredPosts" :key="post.filePath" :post="post" />
        </ul>
        <div v-else class="flex items-center justify-center h-64 op-40 text-sm">
          {{ t('tags.empty') }}
        </div>
      </div>
    </Pane>
  </Splitpanes>
</template>
