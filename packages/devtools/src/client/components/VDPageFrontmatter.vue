<script lang="ts" setup>
import type { Post } from 'valaxy'
import axios from 'axios'
import { consola } from 'consola'

import dayjs from 'dayjs'
import { computed, ref, toRaw } from 'vue'

import { useI18n } from 'vue-i18n'
import { activePath, pageData } from '../composables/app'
import { clientPageData } from '../stores/app'

const props = defineProps<{
  frontmatter: Post
}>()

const newFm = ref<Post>(props.frontmatter)
async function saveNewFm() {
  const res = await axios.post('/valaxy-devtools-api/frontmatter', {
    path: activePath.value,
    pageData: pageData.value,
    frontmatter: toRaw(newFm.value),
  })
  if (res)
    consola.success('Frontmatter saved')
}
const { t } = useI18n()

const date = ref(dayjs(clientPageData.value?.frontmatter.date).toDate())
const updated = ref(dayjs(clientPageData.value?.frontmatter.updated).toDate())

const showPassword = ref(false)

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
  const fm = props.frontmatter
  if (!fm)
    return []

  const entries = Object.entries(fm)
  const meta: [string, unknown][] = []
  const tagsCats: [string, unknown][] = []
  const content: [string, unknown][] = []
  const security: [string, unknown][] = []
  const other: [string, unknown][] = []

  for (const [key, value] of entries) {
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
      class="flex flex-col items-center justify-center py-12 text-center text-gray-400 dark:text-gray-500"
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

    <!-- Grouped fields -->
    <div v-if="frontmatter" class="flex flex-col gap-4">
      <fieldset
        v-for="group in fieldGroups"
        :key="group.key"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
      >
        <legend class="flex items-center gap-1.5 px-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <div :class="group.icon" />
          {{ group.label }}
        </legend>

        <ul class="flex flex-col gap-2">
          <li
            v-for="([key, value]) in group.fields"
            :key="key"
            class="flex gap-2 text-sm min-h-8"
          >
            <div class="w-32 flex items-center h-8">
              <strong>{{ t(`frontmatter.${key}`, key as string) }}</strong>
            </div>

            <div v-if="clientPageData" class="inline-flex items-center w-full min-h-8">
              <div v-if="key === 'tags'" class="w-full">
                <VDFmTagsEditor v-model="clientPageData.frontmatter.tags" />
              </div>
              <template v-else-if="key === 'categories'">
                <VDPostCategories :categories="value as Post['categories']" />
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
                <VDDatePicker v-model="date" show-time />
              </template>
              <template v-else-if="key === 'updated'">
                <VDDatePicker v-model="updated" show-time />
              </template>

              <template v-else-if="key === 'excerpt'">
                <VDTextarea v-model="clientPageData.frontmatter.excerpt" :rows="4" auto-resize />
              </template>
              <template v-else-if="key === 'excerpt_type'">
                <VDFmExcerptType v-model:excerpt-type="clientPageData.frontmatter.excerpt_type" />
              </template>
              <template v-else-if="key === 'pageTitleClass'">
                <code class="px-2 py-1 bg-gray-1 rounded text-xs">
                  {{ value }}
                </code>
              </template>
              <template v-else-if="key === 'password'">
                <div class="flex items-center gap-1">
                  <VDInput
                    v-model="clientPageData.frontmatter.password"
                    :type="showPassword ? 'text' : 'password'"
                    size="sm"
                  />
                  <button
                    class="inline-flex items-center justify-center w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    @click="showPassword = !showPassword"
                  >
                    <div :class="showPassword ? 'i-ri:eye-off-line' : 'i-ri:eye-line'" class="text-sm op-50" />
                  </button>
                </div>
              </template>
              <template v-else-if="typeof value === 'boolean'">
                <VDCheckbox v-model="clientPageData.frontmatter[key]" />
              </template>
              <template v-else-if="typeof value === 'number'">
                <VDNumberField v-model="clientPageData.frontmatter[key]" />
              </template>
              <template v-else>
                <VDInput v-model="clientPageData.frontmatter[key]" size="sm" class="w-full" />
              </template>
            </div>
          </li>
        </ul>
      </fieldset>
    </div>

    <VDButton
      v-if="Object.keys(frontmatter).length"
      class="w-full my-3"
      @click="saveNewFm"
    >
      {{ t('button.save_frontmatter') }}
    </VDButton>
  </div>
</template>
