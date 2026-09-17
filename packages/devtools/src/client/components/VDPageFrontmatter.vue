<script lang="ts" setup>
import type { Post } from 'valaxy'

import dayjs from 'dayjs'
import { computed, onUnmounted, ref, toRaw, toRefs } from 'vue'

import { useI18n } from 'vue-i18n'
import { rpc } from '../rpc'
import { clientPageData, extensions, postList } from '../stores/app'
import { getPostDraft, resetPostDraft } from '../stores/drafts'

const props = defineProps<{
  filePath: string
  frontmatter: Post
}>()
const { t } = useI18n()

const draft = getPostDraft(props.filePath, props.frontmatter)
const { frontmatter: newFm, isSaving } = toRefs(draft)
const externalChanges = computed(() => !isSaving.value && JSON.stringify(props.frontmatter) !== draft.baseline)
function reloadFrontmatter() {
  resetPostDraft(draft, props.frontmatter)
}
const saveMessage = ref<{ severity: 'success' | 'error', text: string } | null>(null)
let clearTimer: ReturnType<typeof setTimeout> | undefined

async function saveNewFm() {
  if (isSaving.value)
    return
  isSaving.value = true
  saveMessage.value = null
  if (clearTimer)
    clearTimeout(clearTimer)
  const filePath = props.filePath
  const frontmatter = structuredClone(toRaw(newFm.value))
  try {
    await rpc.updateFrontmatter({
      filePath,
      frontmatter,
    })
    postList.value = await rpc.getPostList()
    const saved = postList.value.posts.find(post => post.filePath === filePath)
    if (saved && clientPageData.value?.filePath === filePath)
      clientPageData.value = saved
    draft.baseline = JSON.stringify(saved?.frontmatter ?? frontmatter)
    saveMessage.value = { severity: 'success', text: t('frontmatter.save_success') }
  }
  catch (e: any) {
    saveMessage.value = { severity: 'error', text: e.message || t('frontmatter.save_failed') }
  }
  finally {
    isSaving.value = false
    clearTimer = setTimeout(() => {
      saveMessage.value = null
    }, 3000)
  }
}

function dateField(key: 'date' | 'updated') {
  return computed({
    get: () => dayjs(newFm.value[key]).toDate(),
    set: value => newFm.value[key] = dayjs(value).format('YYYY-MM-DD HH:mm:ss'),
  })
}
const date = dateField('date')
const updated = dateField('updated')
onUnmounted(() => clearTimeout(clearTimer))

const showPassword = ref(false)

// Extract all existing tags & categories for suggestions
const allTagSuggestions = computed(() => {
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

const allCategorySuggestions = computed(() => {
  const catSet = new Set<string>()
  for (const post of postList.value.posts) {
    const cats = post.frontmatter.categories
    if (!cats)
      continue
    if (typeof cats === 'string') {
      catSet.add(cats)
    }
    else if (Array.isArray(cats)) {
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

// Field grouping definitions
const metaFields = new Set(['title', 'date', 'updated', 'draft', 'hide', 'type'])
const tagCatFields = new Set(['tags', 'categories'])
const contentFields = new Set(['excerpt', 'excerpt_type', 'cover', 'toc'])
const securityFields = new Set(['password', 'password_hint', 'encryptedContent', 'partiallyEncryptedContents'])

interface FieldGroup {
  key: string
  icon: string
  label: string
  fields: [string, unknown][]
}

const fieldGroups = computed<FieldGroup[]>(() => {
  const fm = newFm.value
  if (!fm)
    return []

  const entries = Object.entries(fm)
  const meta: [string, unknown][] = []
  const tagsCats: [string, unknown][] = []
  const content: [string, unknown][] = []
  const security: [string, unknown][] = []
  const other: [string, unknown][] = []

  const extensionKeys = new Set(extensions.value.plugins.flatMap(plugin => plugin.fields.map(field => field.key)))
  for (const [key, value] of entries) {
    if (extensionKeys.has(key))
      continue
    if (metaFields.has(key))
      meta.push([key, value])
    else if (tagCatFields.has(key))
      tagsCats.push([key, value])
    else if (contentFields.has(key))
      content.push([key, value])
    else if (securityFields.has(key))
      security.push([key, value])
    else other.push([key, value])
  }

  const groups: FieldGroup[] = []
  if (meta.length)
    groups.push({ key: 'meta', icon: 'i-ri:file-info-line', label: 'Metadata', fields: meta })
  if (tagsCats.length)
    groups.push({ key: 'tags', icon: 'i-ri:price-tag-3-line', label: 'Tags & Categories', fields: tagsCats })
  if (content.length)
    groups.push({ key: 'content', icon: 'i-ri:article-line', label: 'Content', fields: content })
  if (security.length)
    groups.push({ key: 'security', icon: 'i-ri:lock-line', label: 'Security', fields: security })
  if (other.length)
    groups.push({ key: 'other', icon: 'i-ri:more-line', label: 'Other', fields: other })

  return groups
})
</script>

<template>
  <div p-2>
    <!-- Empty state hint -->
    <div
      v-if="!clientPageData?.routePath || clientPageData.routePath === '/'"
      class="flex flex-col items-center justify-center py-12 text-center color-faint"
    >
      <div class="i-ri:file-list-3-line text-4xl mb-3 op-30" />
      <p class="text-sm">
        {{ t('devtools.select_post_hint', 'Select a post to edit frontmatter') }}
      </p>
    </div>

    <!-- Route/file info -->
    <div v-else class="flex flex-col gap-2 mb-3">
      <VDFormItem
        :label="t('pageData.routePath')" :value="clientPageData?.routePath"
      />
      <VDFormItem
        :label="t('pageData.filePath')" :value="clientPageData?.filePath"
      />
    </div>

    <VDMessage v-if="externalChanges" severity="warn" class="mb-3">
      {{ t('connection.external_changes') }}
      <button class="underline ml-2" @click="reloadFrontmatter">
        {{ t('connection.reload') }}
      </button>
    </VDMessage>

    <!-- Grouped fields -->
    <div v-if="frontmatter" class="flex flex-col gap-4">
      <fieldset
        v-for="group in fieldGroups"
        :key="group.key"
        class="border border-base rounded-lg p-3"
      >
        <legend class="flex items-center gap-1.5 px-2 text-xs font-semibold color-muted">
          <div :class="group.icon" />
          {{ group.label }}
        </legend>

        <ul class="flex flex-col gap-2">
          <li
            v-for="([key, value]) in group.fields"
            :key="key"
            class="flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm min-h-8"
          >
            <div class="sm:w-28 sm:shrink-0 flex items-center min-h-6">
              <strong :id="`frontmatter-${key}`" class="font-normal color-muted">{{ t(`frontmatter.${key}`, key as string) }}</strong>
            </div>

            <div v-if="clientPageData" class="inline-flex items-center w-full min-w-0 min-h-8">
              <div v-if="key === 'tags'" class="w-full">
                <VDFmTagsEditor v-model="newFm.tags" :suggestions="allTagSuggestions" />
              </div>
              <template v-else-if="key === 'categories'">
                <VDFmCategoriesEditor v-model="(newFm as any).categories" :suggestions="allCategorySuggestions" />
              </template>
              <template v-else-if="key === 'encryptedContent'">
                [Encrypted]
              </template>
              <template v-else-if="key === 'partiallyEncryptedContents'">
                [Partially Encrypted]
              </template>
              <template v-else-if="key === 'cover'">
                <a :href="value as string" target="_blank">
                  <img :src="value as string" class="max-h-20 rounded shadow">
                </a>
              </template>
              <template v-else-if="key === 'date'">
                <VDDatePicker v-model="date" :aria-labelledby="`frontmatter-${key}`" show-time />
              </template>
              <template v-else-if="key === 'updated'">
                <VDDatePicker v-model="updated" :aria-labelledby="`frontmatter-${key}`" show-time />
              </template>

              <template v-else-if="key === 'excerpt'">
                <VDTextarea v-model="newFm.excerpt" :aria-labelledby="`frontmatter-${key}`" :rows="4" auto-resize />
              </template>
              <template v-else-if="key === 'excerpt_type'">
                <VDFmExcerptType v-model:excerpt-type="newFm.excerpt_type" />
              </template>
              <template v-else-if="key === 'pageTitleClass'">
                <code class="px-2 py-1 bg-secondary rounded text-xs">
                  {{ value }}
                </code>
              </template>
              <template v-else-if="key === 'password'">
                <div class="flex items-center gap-1">
                  <VDInput
                    v-model="newFm.password"
                    :type="showPassword ? 'text' : 'password'"
                    size="sm"
                  />
                  <button
                    class="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-hover cursor-pointer transition-colors"
                    @click="showPassword = !showPassword"
                  >
                    <div :class="showPassword ? 'i-ri:eye-off-line' : 'i-ri:eye-line'" class="text-sm op-50" />
                  </button>
                </div>
              </template>
              <template v-else-if="typeof value === 'boolean'">
                <VDCheckbox v-model="newFm[key]" :aria-labelledby="`frontmatter-${key}`" />
              </template>
              <template v-else-if="typeof value === 'number'">
                <VDNumberField v-model="newFm[key]" :aria-labelledby="`frontmatter-${key}`" />
              </template>
              <template v-else>
                <VDInput v-model="newFm[key]" :aria-labelledby="`frontmatter-${key}`" size="sm" class="w-full" />
              </template>
            </div>
          </li>
        </ul>
      </fieldset>
    </div>

    <VDPluginEditor v-if="clientPageData" v-model="newFm" />

    <div v-if="Object.keys(frontmatter).length" class="px-2">
      <VDMessage v-if="saveMessage" :severity="saveMessage.severity" closable class="mb-2">
        {{ saveMessage.text }}
      </VDMessage>
      <VDButton
        class="w-full my-3"
        :loading="isSaving"
        @click="saveNewFm"
      >
        {{ t('button.save_frontmatter') }}
      </VDButton>
    </div>
  </div>
</template>
