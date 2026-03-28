<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { clientPageData, postList } from '../stores/app'

const { t, locale } = useI18n()

const monthFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'long' }))

const sortedPosts = computed(() => {
  return [...postList.value.posts]
    .filter(p => p.frontmatter.date)
    .sort((a, b) => new Date(b.frontmatter.date!).getTime() - new Date(a.frontmatter.date!).getTime())
})

const groupedPosts = computed(() => {
  const groups = new Map<number, Map<number, typeof sortedPosts.value>>()
  for (const post of sortedPosts.value) {
    const date = new Date(post.frontmatter.date!)
    const year = date.getFullYear()
    const month = date.getMonth()
    if (!groups.has(year))
      groups.set(year, new Map())
    const yearGroup = groups.get(year)!
    if (!yearGroup.has(month))
      yearGroup.set(month, [])
    yearGroup.get(month)!.push(post)
  }
  const sortedYears = [...groups.entries()].sort((a, b) => b[0] - a[0])
  return sortedYears.map(([year, months]) => ({
    year,
    months: [...months.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([month, posts]) => ({ month, posts })),
  }))
})

function formatMonth(month: number) {
  return monthFormatter.value.format(new Date(2000, month, 1))
}

function formatDay(date: string | number | Date | undefined) {
  if (!date)
    return ''
  const d = new Date(date)
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function selectPost(post: typeof sortedPosts.value[number]) {
  clientPageData.value = post
}
</script>

<template>
  <Splitpanes class="h-full">
    <Pane min-size="20" size="33">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <div class="i-ri-archive-line op-60" />
          <h3 class="text-sm font-bold flex-1">
            {{ t('archives.title') }}
          </h3>
          <span class="text-xs op-50 tabular-nums">
            {{ t('archives.posts_count', { count: sortedPosts.length }) }}
          </span>
        </div>

        <div class="flex-1 overflow-auto p-4">
          <div class="flex flex-col">
            <div v-for="yearGroup in groupedPosts" :key="yearGroup.year" class="mb-5">
              <!-- Year -->
              <h2 class="text-base font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                {{ yearGroup.year }}
              </h2>

              <div v-for="monthGroup in yearGroup.months" :key="monthGroup.month" class="ml-1.25 border-l-2 border-gray-200 dark:border-gray-700 pl-4 mb-3">
                <!-- Month -->
                <h3 class="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  {{ formatMonth(monthGroup.month) }}
                </h3>

                <!-- Posts -->
                <ul class="flex flex-col gap-0.5">
                  <li
                    v-for="post in monthGroup.posts"
                    :key="post.routePath"
                    class="flex items-center gap-2 py-1 px-2 rounded cursor-pointer transition-colors group"
                    :class="clientPageData?.routePath === post.routePath
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'"
                    @click="selectPost(post)"
                  >
                    <div
                      class="w-1.5 h-1.5 rounded-full shrink-0 transition-colors"
                      :class="clientPageData?.routePath === post.routePath
                        ? 'bg-indigo-500'
                        : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-indigo-400'"
                    />
                    <span class="text-sm truncate flex-1">
                      {{ post.frontmatter.title || post.routePath }}
                    </span>
                    <span class="text-xs op-40 tabular-nums shrink-0">
                      {{ formatDay(post.frontmatter.date) }}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="groupedPosts.length === 0" class="flex flex-col items-center justify-center py-12 op-40">
              <div class="i-ri-archive-line text-4xl mb-2" />
              <span class="text-sm">{{ t('archives.posts_count', { count: 0 }) }}</span>
            </div>
          </div>
        </div>
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
