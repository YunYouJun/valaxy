<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import configMeta from '../config-meta.json'
import { configData, configLoading, configSaveMessage, fetchConfig } from '../stores/config'
import { openInEditor } from '../utils/api'

const { t, locale } = useI18n()

// Tab state
const viewMode = ref<'quick' | 'all'>('quick')
const quickTab = ref<'site' | 'author' | 'features' | 'build' | 'theme'>('site')

// Search for All Options
const searchQuery = ref('')

// Collapsed sections for All Options tree
const collapsedSections = ref<Set<string>>(new Set())

function toggleSection(key: string) {
  if (collapsedSections.value.has(key))
    collapsedSections.value.delete(key)
  else
    collapsedSections.value.add(key)
}

// Helper to get config value by dot path
function getConfigValue(configType: 'site' | 'valaxy' | 'theme', path: string): any {
  if (!configData.value)
    return undefined
  const source = configType === 'site'
    ? configData.value.siteConfig
    : configType === 'theme'
      ? configData.value.themeConfig
      : configData.value.valaxyConfig
  const parts = path.split('.')
  let current: any = source
  for (const part of parts) {
    if (current == null)
      return undefined
    current = current[part]
  }
  return current
}

// Helper to get field description based on locale
function getDescription(field: { description?: string, descriptionZh?: string }): string {
  if (locale.value === 'zh-CN' && field.descriptionZh)
    return field.descriptionZh
  return field.description || ''
}

// Filtered config meta for search
interface FlatField {
  path: string
  name: string
  type: string
  description: string
  descriptionZh?: string
  default?: string
  section: string
  configType: 'site' | 'valaxy'
  value: any
}

function flattenFields(
  fields: typeof configMeta.siteConfig,
  prefix: string,
  section: string,
  configType: 'site' | 'valaxy',
): FlatField[] {
  const result: FlatField[] = []
  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name
    result.push({
      path,
      name: field.name,
      type: field.type,
      description: field.description || '',
      descriptionZh: field.descriptionZh,
      default: field.default,
      section,
      configType,
      value: getConfigValue(configType, path),
    })
    if ('children' in field && field.children) {
      result.push(...flattenFields(field.children as typeof configMeta.siteConfig, path, section, configType))
    }
  }
  return result
}

const allFlatFields = computed(() => {
  const siteFields = flattenFields(configMeta.siteConfig, '', 'SiteConfig', 'site')
  const valaxyFields = flattenFields(configMeta.valaxyConfig, '', 'ValaxyConfig', 'valaxy')
  return [...siteFields, ...valaxyFields]
})

const filteredFields = computed(() => {
  if (!searchQuery.value)
    return allFlatFields.value
  const q = searchQuery.value.toLowerCase()
  return allFlatFields.value.filter(f =>
    f.path.toLowerCase().includes(q)
    || f.description.toLowerCase().includes(q)
    || (f.descriptionZh && f.descriptionZh.toLowerCase().includes(q)),
  )
})

// Theme config entries
const themeConfigEntries = computed(() => {
  if (!configData.value?.themeConfig)
    return []
  return Object.entries(configData.value.themeConfig).filter(([k]) => k !== 'pkg')
})

// Copy snippet to clipboard
async function copySnippet(field: FlatField) {
  const value = field.value
  const valueStr = typeof value === 'string'
    ? `'${value}'`
    : JSON.stringify(value)
  const snippet = `${field.path}: ${valueStr}`
  try {
    await navigator.clipboard.writeText(snippet)
  }
  catch { /* ignore */ }
}

function openConfigFile(configType: 'site' | 'valaxy') {
  if (!configData.value)
    return
  const file = configType === 'site'
    ? configData.value.siteConfigPath
    : configData.value.valaxyConfigPath
  if (file) {
    openInEditor({ file })
  }
}

const quickTabs = computed(() => [
  { value: 'site', label: t('config.tab_site'), icon: 'i-ri:global-line' },
  { value: 'author', label: t('config.tab_author'), icon: 'i-ri:user-line' },
  { value: 'features', label: t('config.tab_features'), icon: 'i-ri:flashlight-line' },
  { value: 'build', label: t('config.tab_build'), icon: 'i-ri:hammer-line' },
  { value: 'theme', label: t('config.tab_theme'), icon: 'i-ri:palette-line' },
])
</script>

<template>
  <div class="h-full overflow-auto">
    <!-- Header -->
    <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-sm font-bold flex-1">
        {{ t('config.title') }}
      </h3>
      <div class="flex items-center gap-1">
        <VDTooltip :content="t('config.open_site_config')">
          <button
            class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            @click="openConfigFile('site')"
          >
            <div class="i-ri:file-text-line" />
            site.config.ts
          </button>
        </VDTooltip>
        <VDTooltip :content="t('config.open_valaxy_config')">
          <button
            class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
            @click="openConfigFile('valaxy')"
          >
            <div class="i-ri:file-text-line" />
            valaxy.config.ts
          </button>
        </VDTooltip>
        <button
          class="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
          :disabled="configLoading"
          @click="fetchConfig"
        >
          <div class="i-ri:refresh-line" :class="{ 'animate-spin': configLoading }" />
        </button>
      </div>
    </div>

    <!-- Save status message -->
    <div v-if="configSaveMessage" class="px-3 pt-2">
      <VDMessage :severity="configSaveMessage.type === 'success' ? 'success' : 'error'" closable>
        {{ configSaveMessage.text }}
      </VDMessage>
    </div>

    <!-- Loading -->
    <div v-if="configLoading && !configData" class="p-8 text-center text-sm op-50">
      {{ t('config.loading') }}
    </div>

    <!-- Main content -->
    <div v-else-if="configData" class="p-4">
      <!-- View mode toggle -->
      <div class="mb-4">
        <VDToggleGroup
          v-model="viewMode"
          :options="[
            { label: t('config.quick_edit'), value: 'quick', icon: 'i-ri:edit-line' },
            { label: t('config.all_options'), value: 'all', icon: 'i-ri:list-settings-line' },
          ]"
        />
      </div>

      <!-- Quick Edit Mode -->
      <div v-if="viewMode === 'quick'" class="max-w-2xl">
        <!-- Quick tab navigation -->
        <div class="flex gap-1 mb-4 flex-wrap">
          <button
            v-for="tab in quickTabs" :key="tab.value"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border transition-colors"
            :class="quickTab === tab.value
              ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="quickTab = tab.value as any"
          >
            <div :class="tab.icon" class="text-sm" />
            {{ tab.label }}
          </button>
        </div>

        <!-- Site Info Tab -->
        <div v-if="quickTab === 'site'" class="flex flex-col gap-5">
          <ConfigFieldInput
            config-type="site"
            field="title"
            :label="t('config.field_title')"
            :description="getDescription({ description: 'Site title', descriptionZh: '站点标题' })"
            :model-value="getConfigValue('site', 'title')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="subtitle"
            :label="t('config.field_subtitle')"
            :description="getDescription({ description: 'Site subtitle', descriptionZh: '副标题' })"
            :model-value="getConfigValue('site', 'subtitle')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="description"
            :label="t('config.field_description')"
            :description="getDescription({ description: 'Site description', descriptionZh: '站点描述' })"
            :model-value="getConfigValue('site', 'description')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="url"
            :label="t('config.field_url')"
            :description="getDescription({ description: 'Site URL, required for SSG & RSS', descriptionZh: '站点 URL，SSG 和 RSS 需要' })"
            :model-value="getConfigValue('site', 'url')"
            placeholder="https://example.com"
            @saved="fetchConfig"
          />
          <ConfigFieldSelect
            config-type="site"
            field="mode"
            :label="t('config.field_mode')"
            :description="getDescription({ description: 'Light/Dark mode', descriptionZh: '亮色/暗色模式' })"
            :model-value="getConfigValue('site', 'mode') || 'auto'"
            :options="[
              { label: 'Auto', value: 'auto' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' },
            ]"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="lang"
            :label="t('config.field_lang')"
            :description="getDescription({ description: 'Default language', descriptionZh: '默认语言' })"
            :model-value="getConfigValue('site', 'lang')"
            placeholder="en"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="favicon"
            :label="t('config.field_favicon')"
            :description="getDescription({ description: 'Website icon', descriptionZh: '站点图标' })"
            :model-value="getConfigValue('site', 'favicon')"
            placeholder="/favicon.svg"
            @saved="fetchConfig"
          />
          <ConfigFieldNumber
            config-type="site"
            field="pageSize"
            :label="t('config.field_page_size')"
            :description="getDescription({ description: 'Posts per page', descriptionZh: '每页显示文章数' })"
            :model-value="getConfigValue('site', 'pageSize')"
            :min="1"
            :max="100"
            @saved="fetchConfig"
          />
        </div>

        <!-- Author Tab -->
        <div v-else-if="quickTab === 'author'" class="flex flex-col gap-5">
          <ConfigFieldInput
            config-type="site"
            field="author.name"
            :label="t('config.field_author_name')"
            :description="getDescription({ description: 'Your name', descriptionZh: '你的名字' })"
            :model-value="getConfigValue('site', 'author.name')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="author.email"
            :label="t('config.field_author_email')"
            :description="getDescription({ description: 'Your email', descriptionZh: '邮箱' })"
            :model-value="getConfigValue('site', 'author.email')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="author.link"
            :label="t('config.field_author_link')"
            :description="getDescription({ description: 'Your profile link', descriptionZh: '个人链接' })"
            :model-value="getConfigValue('site', 'author.link')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="author.avatar"
            :label="t('config.field_author_avatar')"
            :description="getDescription({ description: 'Avatar URL', descriptionZh: '头像 URL' })"
            :model-value="getConfigValue('site', 'author.avatar')"
            @saved="fetchConfig"
          />
          <ConfigFieldInput
            config-type="site"
            field="author.intro"
            :label="t('config.field_author_intro')"
            :description="getDescription({ description: 'Personal introduction', descriptionZh: '个人简介' })"
            :model-value="getConfigValue('site', 'author.intro')"
            @saved="fetchConfig"
          />
          <ConfigFieldGroup :title="t('config.field_author_status')" icon="i-ri:emotion-line">
            <ConfigFieldInput
              config-type="site"
              field="author.status.emoji"
              :label="t('config.field_status_emoji')"
              :description="getDescription({ description: 'Status emoji', descriptionZh: '状态 Emoji' })"
              :model-value="getConfigValue('site', 'author.status.emoji')"
              @saved="fetchConfig"
            />
            <ConfigFieldInput
              config-type="site"
              field="author.status.message"
              :label="t('config.field_status_message')"
              :description="getDescription({ description: 'Hover message', descriptionZh: '悬浮消息' })"
              :model-value="getConfigValue('site', 'author.status.message')"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>
        </div>

        <!-- Features Tab -->
        <div v-else-if="quickTab === 'features'" class="flex flex-col gap-5">
          <ConfigFieldGroup :title="t('config.group_search')" icon="i-ri:search-line">
            <ConfigFieldCheckbox
              config-type="site"
              field="search.enable"
              :label="t('config.field_search_enable')"
              :description="getDescription({ description: 'Enable search', descriptionZh: '启用搜索' })"
              :model-value="getConfigValue('site', 'search.enable')"
              @saved="fetchConfig"
            />
            <ConfigFieldSelect
              config-type="site"
              field="search.provider"
              :label="t('config.field_search_provider')"
              :description="getDescription({ description: 'Search provider', descriptionZh: '搜索提供商' })"
              :model-value="getConfigValue('site', 'search.provider') || 'fuse'"
              :options="[
                { label: 'Fuse (Local)', value: 'fuse' },
                { label: 'Algolia', value: 'algolia' },
                { label: 'Engine', value: 'engine' },
              ]"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>

          <ConfigFieldGroup :title="t('config.group_comment')" icon="i-ri:chat-3-line">
            <ConfigFieldCheckbox
              config-type="site"
              field="comment.enable"
              :label="t('config.field_comment_enable')"
              :description="getDescription({ description: 'Enable comment', descriptionZh: '启用评论' })"
              :model-value="getConfigValue('site', 'comment.enable')"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>

          <ConfigFieldGroup :title="t('config.group_license')" icon="i-ri:copyright-line">
            <ConfigFieldCheckbox
              config-type="site"
              field="license.enabled"
              :label="t('config.field_license_enabled')"
              :description="getDescription({ description: 'Show license', descriptionZh: '显示协议' })"
              :model-value="getConfigValue('site', 'license.enabled')"
              @saved="fetchConfig"
            />
            <ConfigFieldSelect
              config-type="site"
              field="license.type"
              :label="t('config.field_license_type')"
              :description="getDescription({ description: 'License type', descriptionZh: '协议类型' })"
              :model-value="getConfigValue('site', 'license.type') || 'by-nc-sa'"
              :options="[
                { label: 'CC BY-NC-SA', value: 'by-nc-sa' },
                { label: 'CC BY-SA', value: 'by-sa' },
                { label: 'CC BY-NC', value: 'by-nc' },
                { label: 'CC BY-NC-ND', value: 'by-nc-nd' },
                { label: 'CC BY-ND', value: 'by-nd' },
                { label: 'CC0', value: 'zero' },
              ]"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>

          <ConfigFieldGroup :title="t('config.group_sponsor')" icon="i-ri:heart-line">
            <ConfigFieldCheckbox
              config-type="site"
              field="sponsor.enable"
              :label="t('config.field_sponsor_enable')"
              :description="getDescription({ description: 'Enable sponsor', descriptionZh: '启用赞助' })"
              :model-value="getConfigValue('site', 'sponsor.enable')"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>

          <ConfigFieldCheckbox
            config-type="site"
            field="lastUpdated"
            :label="t('config.field_last_updated')"
            :description="getDescription({ description: 'Show last updated time', descriptionZh: '显示最后更新时间' })"
            :model-value="getConfigValue('site', 'lastUpdated')"
            @saved="fetchConfig"
          />

          <ConfigFieldCheckbox
            config-type="site"
            field="statistics.enable"
            :label="t('config.field_statistics_enable')"
            :description="getDescription({ description: 'Enable reading statistics', descriptionZh: '启用阅读统计' })"
            :model-value="getConfigValue('site', 'statistics.enable')"
            @saved="fetchConfig"
          />

          <ConfigFieldCheckbox
            config-type="site"
            field="mediumZoom.enable"
            :label="t('config.field_medium_zoom')"
            :description="getDescription({ description: 'Enable image preview', descriptionZh: '启用图片预览' })"
            :model-value="getConfigValue('site', 'mediumZoom.enable')"
            @saved="fetchConfig"
          />

          <ConfigFieldGroup :title="t('config.group_llms')" icon="i-ri:robot-line">
            <ConfigFieldCheckbox
              config-type="site"
              field="llms.enable"
              :label="t('config.field_llms_enable')"
              :description="getDescription({ description: 'Enable llms.txt output', descriptionZh: '启用 llms.txt 输出' })"
              :model-value="getConfigValue('site', 'llms.enable')"
              @saved="fetchConfig"
            />
            <ConfigFieldCheckbox
              config-type="site"
              field="llms.fullText"
              :label="t('config.field_llms_full_text')"
              :description="getDescription({ description: 'Generate llms-full.txt', descriptionZh: '生成 llms-full.txt' })"
              :model-value="getConfigValue('site', 'llms.fullText')"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>
        </div>

        <!-- Build Tab -->
        <div v-else-if="quickTab === 'build'" class="flex flex-col gap-5">
          <ConfigFieldInput
            config-type="valaxy"
            field="theme"
            :label="t('config.field_theme')"
            :description="getDescription({ description: 'Theme name', descriptionZh: '主题名称' })"
            :model-value="getConfigValue('valaxy', 'theme')"
            @saved="fetchConfig"
          />
          <ConfigFieldSelect
            config-type="site"
            field="orderBy"
            :label="t('config.field_order_by')"
            :description="getDescription({ description: 'Post ordering', descriptionZh: '文章排序方式' })"
            :model-value="getConfigValue('site', 'orderBy') || 'date'"
            :options="[
              { label: 'Date', value: 'date' },
              { label: 'Updated', value: 'updated' },
            ]"
            @saved="fetchConfig"
          />
          <ConfigFieldGroup :title="t('config.group_excerpt')" icon="i-ri:file-text-line">
            <ConfigFieldCheckbox
              config-type="site"
              field="excerpt.auto"
              :label="t('config.field_excerpt_auto')"
              :description="getDescription({ description: 'Auto-generate excerpt', descriptionZh: '自动生成摘要' })"
              :model-value="getConfigValue('site', 'excerpt.auto')"
              @saved="fetchConfig"
            />
            <ConfigFieldNumber
              config-type="site"
              field="excerpt.length"
              :label="t('config.field_excerpt_length')"
              :description="getDescription({ description: 'Max excerpt length', descriptionZh: '摘要最大长度' })"
              :model-value="getConfigValue('site', 'excerpt.length')"
              :min="50"
              :max="1000"
              :step="50"
              @saved="fetchConfig"
            />
          </ConfigFieldGroup>
        </div>

        <!-- Theme Tab -->
        <div v-else-if="quickTab === 'theme'" class="flex flex-col gap-5">
          <p v-if="themeConfigEntries.length === 0" class="text-sm op-50">
            {{ t('config.no_theme_config') }}
          </p>
          <template v-for="[key, value] in themeConfigEntries" :key="key">
            <ConfigFieldInput
              v-if="typeof value === 'string'"
              config-type="theme"
              :field="key"
              :label="key"
              :model-value="value"
              @saved="fetchConfig"
            />
            <ConfigFieldCheckbox
              v-else-if="typeof value === 'boolean'"
              config-type="theme"
              :field="key"
              :label="key"
              :model-value="value"
              @saved="fetchConfig"
            />
            <ConfigFieldNumber
              v-else-if="typeof value === 'number'"
              config-type="theme"
              :field="key"
              :label="key"
              :model-value="value"
              @saved="fetchConfig"
            />
            <div v-else class="flex flex-col gap-1.5">
              <label class="text-sm font-medium">{{ key }}</label>
              <code class="px-2 py-1 bg-gray-1 dark:bg-dark rounded text-xs break-all">
                {{ JSON.stringify(value) }}
              </code>
            </div>
          </template>
        </div>
      </div>

      <!-- All Options Mode -->
      <div v-else class="max-w-3xl">
        <!-- Search -->
        <div class="mb-4">
          <VDInput
            v-model="searchQuery"
            :placeholder="t('config.search_placeholder')"
            size="md"
            class="w-full"
          />
        </div>

        <!-- Grouped by section -->
        <div class="flex flex-col gap-2">
          <div
            v-for="section in ['SiteConfig', 'ValaxyConfig']"
            :key="section"
            class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
              @click="toggleSection(section)"
            >
              <div
                class="i-ri:arrow-right-s-line text-sm transition-transform"
                :class="{ 'rotate-90': !collapsedSections.has(section) }"
              />
              {{ section }}
              <span class="text-xs op-50 font-normal">
                ({{ filteredFields.filter(f => f.section === section).length }})
              </span>
            </button>

            <div v-if="!collapsedSections.has(section)" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="field in filteredFields.filter(f => f.section === section)"
                :key="field.path"
                class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <code class="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        {{ field.path }}
                      </code>
                      <span class="text-xs op-40">({{ field.type }})</span>
                      <span v-if="field.default" class="text-xs op-40">
                        = {{ field.default }}
                      </span>
                    </div>
                    <p v-if="getDescription(field)" class="text-xs op-60 mt-0.5">
                      {{ getDescription(field) }}
                    </p>
                    <div v-if="field.value !== undefined" class="mt-1">
                      <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded break-all">
                        {{ typeof field.value === 'object' ? JSON.stringify(field.value) : String(field.value) }}
                      </code>
                    </div>
                  </div>

                  <div class="flex items-center gap-1 flex-shrink-0">
                    <VDTooltip :content="t('config.copy_snippet')">
                      <button
                        class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        @click="copySnippet(field)"
                      >
                        <div class="i-ri:clipboard-line text-xs" />
                      </button>
                    </VDTooltip>
                    <VDTooltip :content="t('config.open_in_editor')">
                      <button
                        class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        @click="openConfigFile(field.configType)"
                      >
                        <div class="i-ri:edit-line text-xs" />
                      </button>
                    </VDTooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Theme Config section -->
          <div
            v-if="themeConfigEntries.length > 0"
            class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              class="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors text-left"
              @click="toggleSection('ThemeConfig')"
            >
              <div
                class="i-ri:arrow-right-s-line text-sm transition-transform"
                :class="{ 'rotate-90': !collapsedSections.has('ThemeConfig') }"
              />
              ThemeConfig
              <span class="text-xs op-50 font-normal">
                ({{ themeConfigEntries.length }})
              </span>
            </button>

            <div v-if="!collapsedSections.has('ThemeConfig')" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div
                v-for="[key, value] in themeConfigEntries"
                :key="key"
                class="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div class="flex items-start gap-2">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <code class="text-xs font-mono text-indigo-600 dark:text-indigo-400">
                        themeConfig.{{ key }}
                      </code>
                      <span class="text-xs op-40">({{ typeof value }})</span>
                    </div>
                    <div class="mt-1">
                      <code class="text-xs bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded break-all">
                        {{ typeof value === 'object' ? JSON.stringify(value) : String(value) }}
                      </code>
                    </div>
                  </div>
                  <VDTooltip :content="t('config.open_in_editor')">
                    <button
                      class="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                      @click="openConfigFile('valaxy')"
                    >
                      <div class="i-ri:edit-line text-xs" />
                    </button>
                  </VDTooltip>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No config data -->
    <div v-else class="p-8 text-center text-sm op-50">
      {{ t('config.no_data') }}
    </div>
  </div>
</template>
