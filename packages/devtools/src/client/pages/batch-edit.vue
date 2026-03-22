<script lang="ts" setup>
import type { BatchFrontmatterOperation } from '../../../rpc'
import type { ClientPageData } from '../types'

import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Select from 'primevue/select'

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { rpc } from '../rpc'
import { postList } from '../stores/app'

const { t } = useI18n()

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

const operationTypes = [
  { label: 'Set', value: 'set' },
  { label: 'Delete', value: 'delete' },
  { label: 'Rename', value: 'rename' },
]

function addOperation() {
  operations.value.push({ type: 'set', key: '', value: '', newKey: '' })
}

function removeOperation(index: number) {
  operations.value.splice(index, 1)
}

// --- Collect all frontmatter keys across selected posts ---
const allFrontmatterKeys = computed(() => {
  const keys = new Set<string>()
  const selectedSet = new Set(checkedPosts.value)
  for (const post of postList.value.posts) {
    if (selectedSet.has(post.filePath)) {
      for (const key of Object.keys(post.frontmatter))
        keys.add(key)
    }
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
    return { title: post.frontmatter.title || post.routePath, frontmatter: fm }
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
const resultMessage = ref<{ severity: 'success' | 'error', text: string } | null>(null)

async function executeBatch() {
  const validOps = operations.value.filter(op => op.key.trim())
  if (validOps.length === 0 || checkedPosts.value.length === 0)
    return

  const batchOps: BatchFrontmatterOperation[] = validOps.map(op => ({
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

function getFmValue(post: ClientPageData, key: string): string {
  const val = post.frontmatter[key]
  if (val === undefined || val === null)
    return ''
  if (typeof val === 'object')
    return JSON.stringify(val)
  return String(val)
}
</script>

<template>
  <div class="h-full overflow-auto" p="4">
    <h2 class="text-lg font-bold mb-3">
      {{ t('batchEdit.title') }}
    </h2>

    <!-- Operations Section -->
    <div class="mb-4">
      <h3 class="text-sm font-semibold mb-2">
        {{ t('batchEdit.operations') }}
      </h3>
      <div v-for="(op, index) in operations" :key="index" class="flex gap-2 items-center mb-2">
        <Select
          v-model="op.type"
          :options="operationTypes"
          option-label="label"
          option-value="value"
          size="small"
          class="w-28"
        />
        <InputText
          v-model="op.key"
          :placeholder="t('batchEdit.field_key')"
          size="small"
          class="w-36"
          :list="`fm-keys-${index}`"
        />
        <datalist :id="`fm-keys-${index}`">
          <option v-for="k in allFrontmatterKeys" :key="k" :value="k" />
        </datalist>

        <template v-if="op.type === 'set'">
          <span class="text-xs op-60">=</span>
          <InputText
            v-model="op.value"
            :placeholder="t('batchEdit.field_value')"
            size="small"
            class="flex-1"
          />
        </template>
        <template v-else-if="op.type === 'rename'">
          <span class="text-xs op-60">→</span>
          <InputText
            v-model="op.newKey"
            :placeholder="t('batchEdit.new_key')"
            size="small"
            class="flex-1"
          />
        </template>
        <template v-else>
          <div class="flex-1" />
        </template>

        <Button
          v-if="operations.length > 1"
          icon="i-ri:delete-bin-line"
          severity="danger"
          text
          size="small"
          @click="removeOperation(index)"
        />
      </div>
      <Button
        :label="t('batchEdit.add_operation')"
        icon="i-ri:add-line"
        size="small"
        text
        @click="addOperation"
      />
    </div>

    <!-- Post Selection -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <h3 class="text-sm font-semibold">
          {{ t('batchEdit.select_posts') }}
        </h3>
        <span class="text-xs op-60">({{ checkedPosts.length }}/{{ postList.posts.length }})</span>
        <Button
          :label="allSelected ? t('batchEdit.deselect_all') : t('batchEdit.select_all')"
          size="small"
          text
          @click="toggleSelectAll"
        />
      </div>
      <ul class="max-h-48 overflow-auto border rounded p-2 dark:border-gray-700" flex="~ col gap-1">
        <li
          v-for="post in postList.posts" :key="post.filePath"
          class="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1"
          @click="togglePost(post.filePath)"
        >
          <Checkbox
            :model-value="isChecked(post.filePath)"
            binary
            size="small"
            @click.stop="togglePost(post.filePath)"
          />
          <span class="truncate">{{ post.frontmatter.title || post.routePath }}</span>
        </li>
      </ul>
    </div>

    <!-- Preview Toggle -->
    <div class="mb-4">
      <Button
        :label="previewVisible ? t('batchEdit.hide_preview') : t('batchEdit.show_preview')"
        size="small"
        severity="secondary"
        @click="previewVisible = !previewVisible"
      />
    </div>

    <!-- Preview Table -->
    <div v-if="previewVisible && checkedPosts.length > 0" class="mb-4 overflow-auto">
      <table class="text-xs w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-800">
            <th class="border px-2 py-1 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-800 z-1">
              {{ t('batchEdit.post_title') }}
            </th>
            <th
              v-for="key in allFrontmatterKeys" :key="key"
              class="border px-2 py-1 dark:border-gray-700 whitespace-nowrap"
            >
              {{ key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in previewData" :key="item.title">
            <td class="border px-2 py-1 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-1 font-medium whitespace-nowrap">
              {{ item.title }}
            </td>
            <td
              v-for="key in allFrontmatterKeys" :key="key"
              class="border px-2 py-1 dark:border-gray-700 max-w-40 truncate"
            >
              {{ item.frontmatter[key] ?? '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Current Frontmatter Table (before changes) -->
    <div v-if="!previewVisible && checkedPosts.length > 0" class="mb-4 overflow-auto">
      <h3 class="text-sm font-semibold mb-2">
        {{ t('batchEdit.current_frontmatter') }}
      </h3>
      <table class="text-xs w-full border-collapse">
        <thead>
          <tr class="bg-gray-100 dark:bg-gray-800">
            <th class="border px-2 py-1 dark:border-gray-700 sticky left-0 bg-gray-100 dark:bg-gray-800 z-1">
              {{ t('batchEdit.post_title') }}
            </th>
            <th
              v-for="key in allFrontmatterKeys" :key="key"
              class="border px-2 py-1 dark:border-gray-700 whitespace-nowrap"
            >
              {{ key }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="post in postList.posts.filter(p => checkedPosts.includes(p.filePath))" :key="post.filePath">
            <td class="border px-2 py-1 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-900 z-1 font-medium whitespace-nowrap">
              {{ post.frontmatter.title || post.routePath }}
            </td>
            <td
              v-for="key in allFrontmatterKeys" :key="key"
              class="border px-2 py-1 dark:border-gray-700 max-w-40 truncate"
            >
              {{ getFmValue(post, key) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Submit -->
    <div class="flex gap-2 items-center">
      <Button
        :label="t('batchEdit.execute')"
        :loading="isSubmitting"
        :disabled="checkedPosts.length === 0 || operations.every(op => !op.key.trim())"
        severity="warn"
        size="small"
        @click="executeBatch"
      />
    </div>

    <!-- Result message -->
    <Message v-if="resultMessage" :severity="resultMessage.severity" class="mt-3">
      {{ resultMessage.text }}
    </Message>
  </div>
</template>
