<script setup lang="ts">
import type { PressTheme } from 'valaxy-theme-press'
import { useThemeConfig } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import pkg from '../../../packages/valaxy/package.json'

const config = useThemeConfig<PressTheme.Config>()
const { locale } = useI18n()
const chinese = computed(() => locale.value.startsWith('zh'))
const source = computed(() => (config.value as PressTheme.Config & {
  apiReference?: { revision: string, dirty: boolean }
}).apiReference)
const groups = computed(() => {
  const sidebar = config.value.sidebar
  const entries = !Array.isArray(sidebar) ? sidebar?.['/api/'] : undefined
  const items = Array.isArray(entries) ? entries : entries?.items || []
  const result: { module: string, title: string, items: { text: string, link: string }[] }[] = []
  function visit(entries: PressTheme.SidebarEntry[], parents: string[] = []) {
    const links: { text: string, link: string }[] = []
    for (const entry of entries) {
      if (typeof entry === 'string')
        continue
      if (entry.items?.length)
        visit(entry.items, [...parents, entry.text || 'API'])
      else if (entry.link)
        links.push({ text: entry.text || entry.link, link: entry.link })
    }
    if (links.length)
      result.push({ module: parents[0] || 'API', title: parents.slice(1).join(' / ') || 'API', items: links })
  }
  visit(items)
  const order = ['Functions', 'Variables', 'Interfaces', 'Type Aliases', 'Classes']
  const rank = (title: string) => order.includes(title) ? order.indexOf(title) : order.length
  return result.sort((a, b) => rank(a.title) - rank(b.title))
})
</script>

<template>
  <p class="api-version">
    {{ chinese ? '对应 Valaxy 版本' : 'Valaxy version' }}: <code>{{ pkg.version }}</code>
  </p>
  <p v-if="source" class="api-revision">
    {{ chinese ? '源码提交' : 'Source revision' }}: <code>{{ source.revision.slice(0, 12) }}</code>
    <span v-if="source.dirty"> · {{ chinese ? '含本地未提交修改' : 'Includes uncommitted changes' }}</span>
  </p>
  <PressApiIndex
    :groups="groups"
    :label="chinese ? '筛选 API' : 'Filter APIs'"
    :placeholder="chinese ? '输入 API 名称或分组' : 'Search by API name or category'"
    :all-text="chinese ? '全部模块' : 'All modules'"
    :clear-text="chinese ? '清除筛选' : 'Clear filters'"
    :results-text="chinese ? '个 API' : 'APIs'"
    :empty-text="chinese ? '没有匹配的 API。' : 'No matching APIs.'"
  />
</template>

<style scoped>
.api-version, .api-revision {
  display: inline-block;
  margin: 0 1rem 0.5rem 0;
  font-size: 0.8125rem;
  color: var(--pr-c-text-2);
}
</style>
