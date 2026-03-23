<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { rpc } from '../rpc'
import { postList } from '../stores/app'
import { isStaticMode } from '../utils'

const { t } = useI18n()
const route = useRoute()

const searchQuery = ref('')
const draftFilter = ref<'all' | 'draft' | 'published'>('all')
const isCreating = ref(false)
const showCreateInput = ref(false)
const createMessage = ref<{ severity: 'success' | 'error', text: string } | null>(null)

// Create post form fields
const newPostTitle = ref('')
const newPostPath = ref('')
const newPostTags = ref<string[]>([])
const newPostCategories = ref<string[]>([])

// Extract all existing tags & categories from posts for suggestions
const allTags = computed(() => {
  const tagSet = new Set<string>()
  for (const post of postList.value.posts) {
    const tags = post.frontmatter.tags
    if (Array.isArray(tags)) {
      for (const tag of tags)
        tagSet.add(tag)
    }
  }
  return Array.from(tagSet).sort()
})

const allCategories = computed(() => {
  const catSet = new Set<string>()
  for (const post of postList.value.posts) {
    const cats = post.frontmatter.categories
    if (!cats)
      continue
    if (typeof cats === 'string') {
      catSet.add(cats)
    }
    else if (Array.isArray(cats)) {
      // Could be ['A', 'B'] (single path) or [['A', 'B'], ['C']] (multiple paths)
      if (cats.length > 0 && Array.isArray(cats[0])) {
        for (const c of cats) {
          if (Array.isArray(c))
            c.forEach((s: string) => catSet.add(s))
        }
      }
      else {
        cats.forEach((s: string) => catSet.add(s))
      }
    }
  }
  return Array.from(catSet).sort()
})

// Consume query params from Dashboard navigation
watch(() => route.query, (query) => {
  if (query.draft === 'true')
    draftFilter.value = 'draft'
  else if (query.draft === 'false')
    draftFilter.value = 'published'
  else
    draftFilter.value = 'all'
}, { immediate: true })

const filteredCount = computed(() => {
  let posts = postList.value.posts

  // Draft filter
  if (draftFilter.value === 'draft')
    posts = posts.filter(p => p.frontmatter.draft)
  else if (draftFilter.value === 'published')
    posts = posts.filter(p => !p.frontmatter.draft)

  // Search
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    posts = posts.filter(p =>
      String(p.frontmatter.title || '').toLowerCase().includes(q)
      || p.routePath.toLowerCase().includes(q)
      || (p.frontmatter.tags && Array.isArray(p.frontmatter.tags)
        && p.frontmatter.tags.some((tag: string) => tag.toLowerCase().includes(q))),
    )
  }

  return posts.length
})

function resetCreateForm() {
  newPostTitle.value = ''
  newPostPath.value = ''
  newPostTags.value = []
  newPostCategories.value = []
}

async function createPost() {
  const title = newPostTitle.value.trim()
  if (!title || isCreating.value)
    return

  isCreating.value = true
  createMessage.value = null

  const tags = newPostTags.value.length ? newPostTags.value : undefined
  const categories = newPostCategories.value.length ? newPostCategories.value : undefined
  const path = newPostPath.value.trim() || undefined

  try {
    const result = await rpc.createPost({ title, path, tags, categories })
    if (result.success) {
      createMessage.value = { severity: 'success', text: t('posts.create_success') }
      resetCreateForm()
      showCreateInput.value = false
      // Refresh post list
      postList.value = await rpc.getPostList()
    }
    else {
      createMessage.value = { severity: 'error', text: result.error || t('posts.create_failed') }
    }
  }
  catch (e: any) {
    createMessage.value = { severity: 'error', text: e.message || String(e) }
  }
  finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  if (isStaticMode)
    document.title = 'Valaxy DevTools (Production)'
})
</script>

<template>
  <Splitpanes class="h-full">
    <Pane min-size="20" size="30">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('posts.title') }}
          </h3>
          <span class="text-xs op-50 tabular-nums">{{ filteredCount }}/{{ postList.posts.length }}</span>
          <VDTooltip :content="t('posts.new_post')">
            <button
              class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-indigo-500 transition-colors"
              @click="showCreateInput = !showCreateInput"
            >
              <div class="i-ri:add-line" />
            </button>
          </VDTooltip>
        </div>

        <!-- Create Post Input -->
        <div v-if="showCreateInput" class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
          <div class="flex items-center gap-1.5">
            <VDInput
              v-model="newPostTitle"
              :placeholder="t('posts.new_post_placeholder')"
              size="sm"
              class="flex-1"
              @keydown.enter.prevent="createPost"
            />
            <VDButton
              size="sm"
              icon="i-ri:check-line"
              :loading="isCreating"
              :disabled="!newPostTitle.trim()"
              @click="createPost"
            >
              {{ t('posts.create') }}
            </VDButton>
          </div>
          <VDInput
            v-model="newPostPath"
            :placeholder="t('posts.path_placeholder')"
            size="sm"
            class="w-full"
          >
            <template #prefix>
              pages/posts/
            </template>
            <template #suffix>
              .md
            </template>
          </VDInput>
          <VDFmTagsEditor
            v-model="newPostTags"
            :placeholder="t('posts.tags_placeholder')"
            :suggestions="allTags"
          />
          <VDFmCategoriesEditor
            v-model="newPostCategories"
            :placeholder="t('posts.categories_placeholder')"
            :suggestions="allCategories"
          />
          <VDMessage v-if="createMessage" :severity="createMessage.severity" closable>
            {{ createMessage.text }}
          </VDMessage>
        </div>

        <!-- Search & Filter -->
        <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex flex-col gap-1.5">
          <VDInput
            v-model="searchQuery"
            :placeholder="t('posts.search_placeholder')"
            size="sm"
            class="w-full"
          />
          <div class="flex gap-1">
            <button
              v-for="filter in (['all', 'published', 'draft'] as const)"
              :key="filter"
              class="px-2 py-0.5 text-xs rounded-md border transition-colors"
              :class="draftFilter === filter
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
              @click="draftFilter = filter"
            >
              {{ t(`posts.filter_${filter}`) }}
            </button>
          </div>
        </div>

        <VDPostList class="flex-1" :search-query="searchQuery" :draft-filter="draftFilter" />
      </div>
    </Pane>
    <Pane>
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('posts.detail') }}
          </h3>
        </div>
        <VDPostPanel class="flex-1 overflow-auto" />
      </div>
    </Pane>
  </Splitpanes>
</template>
