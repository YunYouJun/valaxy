<script lang="ts" setup>
import type { ClientPageData } from '../types'
import { Pane, Splitpanes } from 'splitpanes'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { postList } from '../stores/app'

const { t } = useI18n()

interface CategoryNode {
  name: string
  count: number
  children: Map<string, CategoryNode>
  posts: ClientPageData[]
}

const categoryTree = computed(() => {
  const root = new Map<string, CategoryNode>()

  for (const post of postList.value.posts) {
    const cats = post.frontmatter.categories
    if (!cats)
      continue

    // categories can be string, string[], or nested array
    const catPaths: string[][] = []
    if (typeof cats === 'string') {
      catPaths.push([cats])
    }
    else if (Array.isArray(cats)) {
      // Could be ['A', 'B'] (path) or [['A', 'B'], ['C']] (multiple paths)
      if (cats.length > 0 && Array.isArray(cats[0])) {
        for (const c of cats) {
          if (Array.isArray(c))
            catPaths.push(c as string[])
        }
      }
      else {
        catPaths.push(cats as string[])
      }
    }

    for (const path of catPaths) {
      let level = root
      for (let i = 0; i < path.length; i++) {
        const seg = path[i]
        if (!level.has(seg)) {
          level.set(seg, { name: seg, count: 0, children: new Map(), posts: [] })
        }
        const node = level.get(seg)!
        if (i === path.length - 1) {
          node.count++
          node.posts.push(post)
        }
        level = node.children
      }
    }
  }

  return root
})

const selectedCategory = ref<string[]>([])

function selectCategory(path: string[]) {
  selectedCategory.value = path
}

const filteredPosts = computed(() => {
  if (selectedCategory.value.length === 0)
    return []

  // Find the node at the selected path
  let level = categoryTree.value
  let node: CategoryNode | undefined
  for (const seg of selectedCategory.value) {
    node = level.get(seg)
    if (!node)
      return []
    level = node.children
  }
  if (!node)
    return []

  // Collect all posts from this node and descendants
  const posts: ClientPageData[] = []
  function collect(n: CategoryNode) {
    posts.push(...n.posts)
    for (const child of n.children.values())
      collect(child)
  }
  collect(node)

  // Deduplicate by filePath
  const seen = new Set<string>()
  return posts.filter((p) => {
    if (seen.has(p.filePath))
      return false
    seen.add(p.filePath)
    return true
  })
})

function isSelected(path: string[]) {
  return JSON.stringify(selectedCategory.value) === JSON.stringify(path)
}

function getCategoryLabel() {
  return selectedCategory.value.join(' > ')
}
</script>

<template>
  <Splitpanes class="h-full">
    <Pane min-size="20" size="33">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('categories.title') }}
          </h3>
        </div>

        <div class="flex-1 overflow-auto">
          <template v-if="categoryTree.size > 0">
            <div
              v-for="[name, node] in categoryTree"
              :key="name"
            >
              <!-- Root level category -->
              <div
                class="flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                :class="isSelected([name]) ? 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'"
                @click="selectCategory([name])"
              >
                <div class="i-ri:folder-2-line text-sm op-50" />
                <span class="flex-1 truncate">{{ name }}</span>
                <span class="text-xs op-40 tabular-nums">{{ node.count }}</span>
              </div>

              <!-- Child categories -->
              <div
                v-for="[childName, childNode] in node.children"
                :key="childName"
                class="flex items-center gap-2 pl-8 pr-3 py-1.5 text-sm cursor-pointer border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                :class="isSelected([name, childName]) ? 'bg-indigo-50/50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'"
                @click="selectCategory([name, childName])"
              >
                <div class="i-ri:folder-line text-sm op-40" />
                <span class="flex-1 truncate">{{ childName }}</span>
                <span class="text-xs op-40 tabular-nums">{{ childNode.count }}</span>
              </div>
            </div>
          </template>

          <div v-else class="flex-1 flex items-center justify-center op-40 text-sm py-8">
            {{ t('categories.empty') }}
          </div>
        </div>
      </div>
    </Pane>

    <Pane>
      <div v-if="selectedCategory.length > 0" class="h-full overflow-auto">
        <div class="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold">
            {{ getCategoryLabel() }}
          </h3>
          <span class="text-xs op-50">{{ t('categories.posts_count', { count: filteredPosts.length }) }}</span>
        </div>
        <ul class="px-3 py-2">
          <VDPostListItem v-for="post in filteredPosts" :key="post.filePath" :post="post" />
        </ul>
      </div>
      <div v-else class="flex items-center justify-center h-full op-40 text-sm">
        <div class="flex flex-col items-center gap-2">
          <div class="i-ri:folder-2-line text-3xl" />
          <span>{{ t('categories.all') }}</span>
        </div>
      </div>
    </Pane>
  </Splitpanes>
</template>
