<script lang="ts" setup>
import FeedbackEmptyState from '@antfu/design/components/Feedback/FeedbackEmptyState.vue'
import LayoutCard from '@antfu/design/components/Layout/LayoutCard.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { tObject } from '../../../../valaxy/shared'
import VDFooter from '../components/VDFooter.vue'
import { activeEditorPresentation } from '../composables/editor'
import { clientOptions, postList } from '../stores/app'
import { openInEditor } from '../utils'
import { identityColor } from '../utils/colors'

const { t, locale } = useI18n()
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

const metrics = computed(() => [
  { label: 'dashboard.total_posts', value: stats.value.totalPosts, to: '/posts', icon: 'i-ph:article', hue: 250 },
  { label: 'dashboard.published_posts', value: stats.value.publishedPosts, to: '/posts?draft=false', icon: 'i-ph:check-circle', hue: 155 },
  { label: 'dashboard.draft_posts', value: stats.value.draftPosts, to: '/posts?draft=true', icon: 'i-ph:pencil-simple', hue: 65 },
  { label: 'dashboard.total_categories', value: stats.value.totalCategories, to: '/categories', icon: 'i-ph:folders', hue: 205 },
  { label: 'dashboard.total_tags', value: stats.value.totalTags, to: '/tags', icon: 'i-ph:hash', hue: 290 },
])
</script>

<template>
  <div class="h-full overflow-auto bg-secondary">
    <div class="p-4 sm:p-6 flex flex-col gap-5 max-w-5xl mx-auto">
      <div>
        <h1 class="text-lg font-medium color-base">
          {{ t('dashboard.title') }}
        </h1>
        <div class="mt-2 flex items-center gap-2 min-w-0 text-xs color-muted">
          <span class="i-ph:folder-simple shrink-0" aria-hidden="true" />
          <code class="truncate flex-1" :title="clientOptions.userRoot">{{ clientOptions.userRoot || '—' }}</code>
          <VDButton v-if="clientOptions.userRoot" variant="ghost" :icon="activeEditorPresentation?.icon || 'i-ph:code'" :title="t('dashboard.open_in_editor')" :aria-label="t('dashboard.open_in_editor')" @click="openUserRootInEditor" />
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <LayoutCard
          v-for="metric in metrics"
          :key="metric.label"
          as="button"
          type="button"
          class="text-left transition hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
          @click="router.push(metric.to)"
        >
          <div class="flex items-center justify-between gap-2 text-xs color-muted">
            {{ t(metric.label) }}
            <span class="vd-accent vd-tint rounded p-1.5 inline-flex" :style="{ '--vd-hue': metric.hue }" aria-hidden="true"><span :class="metric.icon" /></span>
          </div>
          <div class="text-2xl font-mono tabular-nums vd-accent mt-3" :style="{ '--vd-hue': metric.hue }">
            {{ metric.value }}
          </div>
        </LayoutCard>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LayoutCard class="md:col-span-2" :padding="false">
          <div class="px-4 py-3 border-b border-base flex items-center justify-between gap-2">
            <h2 class="text-sm font-medium">
              {{ t('dashboard.recent_posts') }}
            </h2>
            <RouterLink to="/posts" class="btn-text text-xs color-muted">
              {{ t('dashboard.view_all') }} <span class="i-ph:arrow-right" aria-hidden="true" />
            </RouterLink>
          </div>
          <ul class="p-2">
            <li v-for="post in recentPosts" :key="post.routePath">
              <RouterLink :to="{ path: '/posts', query: { path: post.routePath } }" class="flex items-center gap-3 rounded px-2 py-3 text-sm transition hover:bg-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40">
                <span class="i-ph:file-text color-faint shrink-0" aria-hidden="true" />
                <span class="truncate flex-1">{{ tObject(post.frontmatter.title || '', locale) || post.routePath }}</span>
                <span class="text-xs font-mono color-faint tabular-nums shrink-0">{{ formatDate(post.frontmatter.date) }}</span>
              </RouterLink>
            </li>
          </ul>
          <FeedbackEmptyState v-if="!recentPosts.length" :title="t('batchEdit.no_posts')" icon="i-ph:article" />
        </LayoutCard>
        <div class="flex flex-col gap-4">
          <LayoutCard>
            <h2 class="text-sm font-medium mb-3">
              {{ t('dashboard.top_tags') }}
            </h2>
            <div class="flex flex-wrap gap-1.5">
              <RouterLink v-for="tag in topTags" :key="tag.name" :to="{ path: '/tags', query: { tag: tag.name } }" class="badge vd-accent vd-tint hover:opacity-80 transition" :style="identityColor(tag.name)">
                <span class="i-ph:hash" aria-hidden="true" />{{ tag.name }}
                <span class="font-mono color-faint">{{ tag.count }}</span>
              </RouterLink>
              <span v-if="!topTags.length" class="color-faint text-xs">{{ t('tags.empty') }}</span>
            </div>
          </LayoutCard>
          <LayoutCard>
            <h2 class="text-sm font-medium mb-3">
              {{ t('dashboard.top_categories') }}
            </h2>
            <div class="flex flex-col gap-1">
              <RouterLink v-for="cat in topCategories" :key="cat.name" :to="{ path: '/categories', query: { category: cat.name } }" class="flex items-center gap-2 rounded px-2 py-1.5 text-sm color-muted hover:bg-hover transition">
                <span class="i-ph:folder-simple shrink-0 vd-accent" :style="identityColor(cat.name)" aria-hidden="true" /><span class="truncate flex-1">{{ cat.name }}</span>
                <span class="font-mono color-faint text-xs">{{ cat.count }}</span>
              </RouterLink>
              <span v-if="!topCategories.length" class="color-faint text-xs">{{ t('categories.empty') }}</span>
            </div>
          </LayoutCard>
        </div>
      </div>
      <VDFooter />
    </div>
  </div>
</template>
