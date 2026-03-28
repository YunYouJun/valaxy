<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import VDFooter from '../components/VDFooter.vue'
import { clientOptions, postList } from '../stores/app'
import { openInEditor } from '../utils'

const { t } = useI18n()
const router = useRouter()

function openUserRootInEditor() {
  const userRoot = clientOptions.value.userRoot
  if (userRoot) {
    openInEditor({ file: userRoot })
  }
}

const posts = computed(() => postList.value.posts)

const stats = computed(() => {
  const all = posts.value
  const totalPosts = all.length
  const draftPosts = all.filter(p => p.frontmatter.draft).length
  const publishedPosts = totalPosts - draftPosts

  const categoriesSet = new Set<string>()
  const tagsSet = new Set<string>()
  for (const post of all) {
    const cats = post.frontmatter.categories
    if (cats) {
      if (typeof cats === 'string') {
        categoriesSet.add(cats)
      }
      else if (Array.isArray(cats)) {
        for (const c of cats) {
          if (typeof c === 'string')
            categoriesSet.add(c)
          else if (Array.isArray(c))
            (c as string[]).forEach((s: string) => categoriesSet.add(s))
        }
      }
    }
    const tags = post.frontmatter.tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) tagsSet.add(tag)
    }
  }

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalCategories: categoriesSet.size,
    totalTags: tagsSet.size,
  }
})

const recentPosts = computed(() => {
  return [...posts.value]
    .filter(p => p.frontmatter.date)
    .sort((a, b) => new Date(b.frontmatter.date!).getTime() - new Date(a.frontmatter.date!).getTime())
    .slice(0, 5)
})

const topTags = computed(() => {
  const tagCount = new Map<string, number>()
  for (const post of posts.value) {
    const tags = post.frontmatter.tags
    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        tagCount.set(tag, (tagCount.get(tag) || 0) + 1)
      }
    }
  }
  return [...tagCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }))
})

const topCategories = computed(() => {
  const catCount = new Map<string, number>()
  for (const post of posts.value) {
    const cats = post.frontmatter.categories
    if (cats) {
      if (typeof cats === 'string') {
        catCount.set(cats, (catCount.get(cats) || 0) + 1)
      }
      else if (Array.isArray(cats)) {
        for (const c of cats) {
          const name = typeof c === 'string' ? c : Array.isArray(c) ? (c as string[]).join(' > ') : String(c)
          catCount.set(name, (catCount.get(name) || 0) + 1)
        }
      }
    }
  }
  return [...catCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }))
})

function formatDate(date: string | number | Date | undefined) {
  if (!date)
    return ''
  const d = new Date(date)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function goToPost(routePath: string) {
  router.push({ path: '/posts', query: { path: routePath } })
}

function goToPosts() {
  router.push('/posts')
}

function goToPublishedPosts() {
  router.push({ path: '/posts', query: { draft: 'false' } })
}

function goToDraftPosts() {
  router.push({ path: '/posts', query: { draft: 'true' } })
}

function goToCategories() {
  router.push('/categories')
}

function goToTags() {
  router.push('/tags')
}
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="p-6 flex flex-col gap-6 max-w-3xl mx-auto">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
          Valaxy DevTools
        </h1>
        <p class="text-sm op-50 mt-1">
          {{ t('dashboard.title') }}
        </p>
      </div>

      <!-- User Root -->
      <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div class="flex items-center justify-between mb-1">
          <div class="text-xs op-50">
            {{ t('dashboard.user_root') }}
          </div>
          <div v-if="clientOptions.userRoot" class="flex items-center gap-2">
            <button
              class="inline-flex items-center gap-1 px-2 py-1 text-xs text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors"
              :title="t('dashboard.open_in_editor')"
              @click="openUserRootInEditor"
            >
              <div class="i-ri:code-box-line" />
              {{ t('dashboard.open_in_editor') }}
            </button>
          </div>
        </div>
        <code class="text-sm font-mono text-gray-700 dark:text-gray-300">
          {{ clientOptions.userRoot || '—' }}
        </code>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-5 gap-3">
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
          @click="goToPosts"
        >
          <div class="text-2xl font-bold text-indigo-500">
            {{ stats.totalPosts }}
          </div>
          <div class="text-xs op-50 mt-1">
            {{ t('dashboard.total_posts') }}
          </div>
        </div>
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
          @click="goToPublishedPosts"
        >
          <div class="text-2xl font-bold text-emerald-500">
            {{ stats.publishedPosts }}
          </div>
          <div class="text-xs op-50 mt-1">
            {{ t('dashboard.published_posts') }}
          </div>
        </div>
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-amber-300 dark:hover:border-amber-600 transition-colors"
          @click="goToDraftPosts"
        >
          <div class="text-2xl font-bold text-amber-500">
            {{ stats.draftPosts }}
          </div>
          <div class="text-xs op-50 mt-1">
            {{ t('dashboard.draft_posts') }}
          </div>
        </div>
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-green-300 dark:hover:border-green-600 transition-colors"
          @click="goToCategories"
        >
          <div class="text-2xl font-bold text-green-500">
            {{ stats.totalCategories }}
          </div>
          <div class="text-xs op-50 mt-1">
            {{ t('dashboard.total_categories') }}
          </div>
        </div>
        <div
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          @click="goToTags"
        >
          <div class="text-2xl font-bold text-blue-500">
            {{ stats.totalTags }}
          </div>
          <div class="text-xs op-50 mt-1">
            {{ t('dashboard.total_tags') }}
          </div>
        </div>
      </div>

      <!-- Recent Posts & Tags/Categories -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Recent Posts -->
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <div class="i-ri:article-line op-60" />
              {{ t('dashboard.recent_posts') }}
            </h2>
            <RouterLink to="/posts" class="text-xs text-indigo-500 hover:text-indigo-600 transition-colors">
              {{ t('dashboard.view_all') }}
            </RouterLink>
          </div>
          <ul class="flex flex-col gap-1.5">
            <li
              v-for="post in recentPosts"
              :key="post.routePath"
              class="flex items-center justify-between gap-2 text-sm py-1 px-2 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              @click="goToPost(post.routePath)"
            >
              <span class="truncate text-gray-700 dark:text-gray-300">{{ post.frontmatter.title || post.routePath }}</span>
              <span class="text-xs op-40 tabular-nums shrink-0">{{ formatDate(post.frontmatter.date) }}</span>
            </li>
            <li v-if="recentPosts.length === 0" class="text-xs op-40 text-center py-2">
              —
            </li>
          </ul>
        </div>

        <!-- Tags & Categories -->
        <div class="flex flex-col gap-4">
          <!-- Top Tags -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-3">
              <div class="i-ri:price-tag-3-line op-60" />
              {{ t('dashboard.top_tags') }}
            </h2>
            <div class="flex flex-wrap gap-1.5">
              <RouterLink
                v-for="tag in topTags"
                :key="tag.name"
                :to="{ path: '/tags', query: { tag: tag.name } }"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                <div class="i-ri:hashtag text-2.5" />
                {{ tag.name }}
              </RouterLink>
              <span v-if="topTags.length === 0" class="text-xs op-40">—</span>
            </div>
          </div>

          <!-- Top Categories -->
          <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 class="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-3">
              <div class="i-ri:folder-2-line op-60" />
              {{ t('dashboard.top_categories') }}
            </h2>
            <div class="flex flex-wrap gap-1.5">
              <RouterLink
                v-for="cat in topCategories"
                :key="cat.name"
                :to="{ path: '/categories', query: { category: cat.name } }"
                class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors cursor-pointer"
              >
                <div class="i-ri:folder-2-line text-2.5" />
                {{ cat.name }}
                <span class="op-60">({{ cat.count }})</span>
              </RouterLink>
              <span v-if="topCategories.length === 0" class="text-xs op-40">—</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <VDFooter />
    </div>
  </div>
</template>
