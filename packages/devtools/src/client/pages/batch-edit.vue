<script lang="ts" setup>
import type { BatchFrontmatterOperation } from '../../../rpc'
import type { ClientPageData } from '../types'

import { Pane, Splitpanes } from 'splitpanes'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { tObject } from '../../../../valaxy/shared'

import { rpc } from '../rpc'
import { postList } from '../stores/app'

const { t, locale } = useI18n()

// --- Post selection ---
const checkedPosts = ref<string[]>([])

const allSelected = computed(() =>
  postList.value.posts.length > 0 && checkedPosts.value.length === postList.value.posts.length,
)

function toggleSelectAll() {
  if (allSelected.value)
    checkedPosts.value = []
  else
    checkedPosts.value = postList.value.posts.map(p => p.filePath)
}

function isChecked(filePath: string) {
  return checkedPosts.value.includes(filePath)
}

function togglePost(filePath: string) {
  const idx = checkedPosts.value.indexOf(filePath)
  if (idx >= 0)
    checkedPosts.value.splice(idx, 1)
  else
    checkedPosts.value.push(filePath)
}

// --- Operations ---
interface OperationRow {
  type: 'set' | 'delete' | 'rename'
  key: string
  value: string
  newKey: string
}

const operations = ref<OperationRow[]>([
  { type: 'set', key: '', value: '', newKey: '' },
])

const operationTypes = computed(() => [
  { label: t('batchEdit.op_set'), value: 'set' },
  { label: t('batchEdit.op_delete'), value: 'delete' },
  { label: t('batchEdit.op_rename'), value: 'rename' },
])

function addOperation() {
  operations.value.push({ type: 'set', key: '', value: '', newKey: '' })
}

function removeOperation(index: number) {
  operations.value.splice(index, 1)
}

// --- Collect frontmatter keys for combobox suggestions (all posts) ---
const allPostFrontmatterKeys = computed(() => {
  const keys = new Set<string>()
  for (const post of postList.value.posts) {
    for (const key of Object.keys(post.frontmatter))
      keys.add(key)
  }
  return Array.from(keys).sort()
})

// --- Collect frontmatter keys across selected posts (for table columns) ---
const allFrontmatterKeys = computed(() => {
  const keys = new Set<string>()
  const selectedSet = new Set(checkedPosts.value)
  for (const post of postList.value.posts) {
    if (selectedSet.has(post.filePath)) {
      for (const key of Object.keys(post.frontmatter))
        keys.add(key)
    }
  }
  // Include keys introduced by pending operations so they appear in the preview
  for (const op of operations.value) {
    if (op.key)
      keys.add(op.key)
    if (op.type === 'rename' && op.newKey)
      keys.add(op.newKey)
  }
  return Array.from(keys).sort()
})

// --- Preview ---
const previewVisible = ref(false)
const previewData = computed(() => {
  const selectedSet = new Set(checkedPosts.value)
  const posts = postList.value.posts.filter(p => selectedSet.has(p.filePath))
  return posts.map((post) => {
    const fm = { ...post.frontmatter }
    for (const op of operations.value) {
      if (!op.key)
        continue
      switch (op.type) {
        case 'set':
          fm[op.key] = parseValue(op.value)
          break
        case 'delete':
          delete fm[op.key]
          break
        case 'rename':
          if (op.key in fm && op.newKey) {
            fm[op.newKey] = fm[op.key]
            delete fm[op.key]
          }
          break
      }
    }
    return { title: resolveTitle(post), filePath: post.filePath, frontmatter: fm }
  })
})

function parseValue(str: string): any {
  if (str === 'true')
    return true
  if (str === 'false')
    return false
  const num = Number(str)
  if (!Number.isNaN(num) && str.trim() !== '')
    return num
  return str
}

// --- Execute ---
const isSubmitting = ref(false)
const confirmDialogOpen = ref(false)
const resultMessage = ref<{ severity: 'success' | 'error', text: string } | null>(null)

const validOps = computed(() => operations.value.filter((op) => {
  if (!op.key.trim())
    return false
  if (op.type === 'rename' && !op.newKey.trim())
    return false
  return true
}))

const canExecute = computed(() => validOps.value.length > 0 && checkedPosts.value.length > 0)

function requestExecute() {
  if (!canExecute.value)
    return
  confirmDialogOpen.value = true
}

async function executeBatch() {
  confirmDialogOpen.value = false

  const batchOps: BatchFrontmatterOperation[] = validOps.value.map(op => ({
    type: op.type,
    key: op.key.trim(),
    value: op.type === 'set' ? parseValue(op.value) : undefined,
    newKey: op.type === 'rename' ? op.newKey.trim() : undefined,
  }))

  isSubmitting.value = true
  resultMessage.value = null

  try {
    const result = await rpc.batchUpdateFrontmatter(checkedPosts.value, batchOps)
    if (result.errors.length > 0) {
      resultMessage.value = {
        severity: 'error',
        text: t('batchEdit.result_partial', { updated: result.updated, total: result.total, errors: result.errors.length }),
      }
    }
    else {
      resultMessage.value = {
        severity: 'success',
        text: t('batchEdit.result_success', { updated: result.updated, total: result.total }),
      }
    }
    // Refresh post list
    postList.value = await rpc.getPostList()
  }
  catch (e: any) {
    resultMessage.value = {
      severity: 'error',
      text: e.message || String(e),
    }
  }
  finally {
    isSubmitting.value = false
  }
}

/**
 * Display a frontmatter value with i18n support.
 * For i18n objects like `{ en: 'Hello', 'zh-CN': '你好' }`, show the localized value
 * with a tooltip-friendly full representation.
 */
function displayFmValue(val: unknown): string {
  if (val === undefined || val === null)
    return ''
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    // Try to resolve as i18n object
    const resolved = tObject(val as Record<string, string>, locale.value)
    if (typeof resolved === 'string' && resolved)
      return resolved
    return JSON.stringify(val)
  }
  if (typeof val === 'object')
    return JSON.stringify(val)
  return String(val)
}

/**
 * Resolve post title with i18n support
 */
function resolveTitle(post: { frontmatter: Record<string, any>, routePath?: string }): string {
  const title = post.frontmatter.title
  if (!title)
    return post.routePath || ''
  return typeof title === 'object' ? tObject(title, locale.value) as string : String(title)
}

function getFmValue(post: ClientPageData, key: string): string {
  return displayFmValue(post.frontmatter[key])
}
</script>

<template>
  <Splitpanes class="h-full">
    <!-- Left: Post Selection -->
    <Pane min-size="20" size="33">
      <div class="h-full flex flex-col">
        <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
          <h3 class="text-sm font-bold flex-1">
            {{ t('batchEdit.select_posts') }}
          </h3>
          <span class="text-xs op-50 tabular-nums">{{ checkedPosts.length }}/{{ postList.posts.length }}</span>
          <VDButton
            variant="ghost"
            size="sm"
            @click="toggleSelectAll"
          >
            {{ allSelected ? t('batchEdit.deselect_all') : t('batchEdit.select_all') }}
          </VDButton>
        </div>

        <ul v-if="postList.posts.length > 0" class="flex-1 overflow-auto" flex="~ col gap-0">
          <li
            v-for="post in postList.posts" :key="post.filePath"
            class="flex items-center gap-2 text-sm cursor-pointer px-3 py-1.5 border-b border-gray-50 dark:border-gray-800/50 transition-colors"
            :class="isChecked(post.filePath) ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'"
            @click="togglePost(post.filePath)"
          >
            <VDCheckbox
              :model-value="isChecked(post.filePath)"
              class="pointer-events-none"
            />
            <span class="truncate text-xs">{{ resolveTitle(post) }}</span>
          </li>
        </ul>
        <div v-else class="flex-1 flex items-center justify-center op-40 text-sm">
          {{ t('batchEdit.no_posts') }}
        </div>
      </div>
    </Pane>

    <!-- Right: Operations + Preview -->
    <Pane>
      <div class="h-full overflow-auto p-4 flex flex-col gap-4">
        <!-- Operations Section -->
        <section>
          <div class="flex items-center gap-2 mb-2">
            <h3 class="text-sm font-bold">
              {{ t('batchEdit.operations') }}
            </h3>
            <span class="text-xs op-40">{{ operations.length }}</span>
          </div>

          <div class="border border-gray-200 rounded-lg dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            <div
              v-for="(op, index) in operations" :key="index"
              class="flex gap-2 items-center px-3 py-2"
            >
              <span class="text-xs op-30 w-4 text-right tabular-nums">{{ index + 1 }}</span>
              <VDSelect
                v-model="op.type"
                :options="operationTypes"
                class="w-28"
              />
              <VDCombobox
                v-model="op.key"
                :options="allPostFrontmatterKeys"
                :placeholder="t('batchEdit.field_key')"
                class="w-32"
              />
              <template v-if="op.type === 'set'">
                <span class="text-xs op-40 font-mono">=</span>
                <VDInput
                  v-model="op.value"
                  :placeholder="t('batchEdit.field_value')"
                  size="sm"
                  class="flex-1"
                />
              </template>
              <template v-else-if="op.type === 'rename'">
                <span class="text-xs op-40 font-mono">&rarr;</span>
                <VDInput
                  v-model="op.newKey"
                  :placeholder="t('batchEdit.new_key')"
                  size="sm"
                  class="flex-1"
                />
              </template>
              <template v-else>
                <div class="flex-1" />
              </template>

              <button
                v-if="operations.length > 1"
                class="inline-flex items-center justify-center w-7 h-7 rounded op-40 hover:op-100 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                @click="removeOperation(index)"
              >
                <div class="i-ri:close-line text-sm" />
              </button>
            </div>
          </div>

          <VDButton
            variant="ghost"
            icon="i-ri:add-line"
            size="sm"
            class="mt-1.5"
            @click="addOperation"
          >
            {{ t('batchEdit.add_operation') }}
          </VDButton>
        </section>

        <!-- Action Bar -->
        <section class="flex items-center gap-3">
          <VDButton
            variant="warn"
            :loading="isSubmitting"
            :disabled="!canExecute"
            icon="i-ri:check-line"
            size="sm"
            @click="requestExecute"
          >
            {{ t('batchEdit.execute') }}
          </VDButton>
          <VDButton
            variant="secondary"
            :disabled="checkedPosts.length === 0"
            size="sm"
            :icon="previewVisible ? 'i-ri:eye-off-line' : 'i-ri:eye-line'"
            @click="previewVisible = !previewVisible"
          >
            {{ previewVisible ? t('batchEdit.hide_preview') : t('batchEdit.show_preview') }}
          </VDButton>
          <span v-if="canExecute" class="text-xs op-50">
            {{ t('batchEdit.summary', { ops: validOps.length, posts: checkedPosts.length }) }}
          </span>
        </section>

        <!-- Confirm Dialog -->
        <VDDialog
          v-model:open="confirmDialogOpen"
          :title="t('batchEdit.execute')"
          :description="t('batchEdit.confirm', { ops: validOps.length, posts: checkedPosts.length })"
        >
          <div class="flex gap-2 justify-end mt-4">
            <VDButton variant="secondary" size="sm" @click="confirmDialogOpen = false">
              {{ t('batchEdit.confirm_no') }}
            </VDButton>
            <VDButton variant="warn" size="sm" @click="executeBatch">
              {{ t('batchEdit.confirm_yes') }}
            </VDButton>
          </div>
        </VDDialog>

        <!-- Result Message -->
        <VDMessage v-if="resultMessage" :severity="resultMessage.severity" closable>
          {{ resultMessage.text }}
        </VDMessage>

        <!-- Preview / Current Table -->
        <section v-if="checkedPosts.length > 0" class="flex-1 min-h-0">
          <h3 v-if="!previewVisible" class="text-sm font-bold mb-2 op-70">
            {{ t('batchEdit.current_frontmatter') }}
          </h3>
          <h3 v-else class="text-sm font-bold mb-2 op-70">
            {{ t('batchEdit.show_preview') }}
          </h3>

          <div class="overflow-auto border border-gray-200 rounded-lg dark:border-gray-700 max-h-[calc(100vh-24rem)]">
            <!-- Preview Table -->
            <table v-if="previewVisible" class="text-xs w-full border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800/80">
                  <th class="border-b border-r border-gray-200 px-2 py-1.5 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800/80 z-1 text-left font-semibold">
                    {{ t('batchEdit.post_title') }}
                  </th>
                  <th
                    v-for="key in allFrontmatterKeys" :key="key"
                    class="border-b border-r border-gray-200 last:border-r-0 px-2 py-1.5 dark:border-gray-700 whitespace-nowrap text-left font-semibold"
                  >
                    {{ key }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in previewData" :key="item.filePath"
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td class="border-b border-r border-gray-200 px-2 py-1 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-1 font-medium whitespace-nowrap">
                    {{ item.title }}
                  </td>
                  <td
                    v-for="key in allFrontmatterKeys" :key="key"
                    class="border-b border-r border-gray-200 last:border-r-0 px-2 py-1 dark:border-gray-700 max-w-40 truncate font-mono"
                  >
                    {{ displayFmValue(item.frontmatter[key]) }}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Current Frontmatter Table -->
            <table v-else class="text-xs w-full border-collapse">
              <thead>
                <tr class="bg-gray-50 dark:bg-gray-800/80">
                  <th class="border-b border-r border-gray-200 px-2 py-1.5 dark:border-gray-700 sticky left-0 bg-gray-50 dark:bg-gray-800/80 z-1 text-left font-semibold">
                    {{ t('batchEdit.post_title') }}
                  </th>
                  <th
                    v-for="key in allFrontmatterKeys" :key="key"
                    class="border-b border-r border-gray-200 last:border-r-0 px-2 py-1.5 dark:border-gray-700 whitespace-nowrap text-left font-semibold"
                  >
                    {{ key }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="post in postList.posts.filter(p => checkedPosts.includes(p.filePath))" :key="post.filePath"
                  class="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td class="border-b border-r border-gray-200 px-2 py-1 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-1 font-medium whitespace-nowrap">
                    {{ resolveTitle(post) }}
                  </td>
                  <td
                    v-for="key in allFrontmatterKeys" :key="key"
                    class="border-b border-r border-gray-200 last:border-r-0 px-2 py-1 dark:border-gray-700 max-w-40 truncate font-mono"
                  >
                    {{ getFmValue(post, key) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Empty state: no posts selected -->
        <div v-else class="flex-1 flex flex-col items-center justify-center gap-2 op-35">
          <div class="i-ri:file-list-3-line text-3xl" />
          <span class="text-sm">{{ t('batchEdit.empty_hint') }}</span>
        </div>
      </div>
    </Pane>
  </Splitpanes>
</template>
