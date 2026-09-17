<script setup lang="ts">
import FeedbackEmptyState from '@antfu/design/components/Feedback/FeedbackEmptyState.vue'
import LayoutCard from '@antfu/design/components/Layout/LayoutCard.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import VDCodeBlock from '../components/VDCodeBlock.vue'
import { inspectedPage } from '../stores/app'

const { t } = useI18n()
const debug = computed(() => inspectedPage.value?.debug)
const sections = computed(() => [
  { id: 'route', title: t('debug.route'), icon: 'i-ph:signpost', color: 'text-blue-600 dark:text-blue-300', value: debug.value?.route },
  { id: 'frontmatter', title: 'Frontmatter', icon: 'i-ph:article', color: 'text-amber-700 dark:text-amber-300', value: inspectedPage.value?.frontmatter },
  { id: 'site', title: t('debug.site_config'), icon: 'i-ph:globe', color: 'text-purple-600 dark:text-purple-300', value: debug.value ? { theme: debug.value.config.theme, ...debug.value.config.site } : undefined },
  { id: 'theme', title: t('debug.theme_config'), icon: 'i-ph:palette', color: 'text-purple-600 dark:text-purple-300', value: debug.value?.config.themeConfig },
])
</script>

<template>
  <div class="max-w-6xl mx-auto p-4 sm:p-6 flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-2">
      <h1 class="text-lg font-semibold">
        {{ t('nav.debug') }}
      </h1>
      <span v-if="debug" class="text-xs rounded-full px-2 py-0.5 bg-green-500/10 text-green-700 dark:text-green-300" role="status">
        {{ t('debug.live') }}
      </span>
    </div>
    <FeedbackEmptyState v-if="!debug" :title="t('debug.no_page')" icon="i-ph:browser" class="py-12">
      <template #hint>
        {{ t('debug.connect_hint') }}
      </template>
    </FeedbackEmptyState>
    <template v-else>
      <p class="text-sm color-muted">
        {{ t('debug.description') }}
      </p>
      <LayoutCard as="section" :aria-label="t('debug.viewport')">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 class="text-sm font-semibold flex items-center gap-2">
            <span class="i-ph:devices text-emerald-600 dark:text-emerald-300" aria-hidden="true" />
            {{ t('debug.viewport') }}
          </h2>
          <span class="text-sm font-mono" data-testid="debug-viewport">{{ debug.viewport.width }} × {{ debug.viewport.height }} px</span>
        </div>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="breakpoint in debug.viewport.breakpoints" :key="breakpoint.label"
            class="rounded-md px-2 py-1 text-xs font-mono"
            :class="breakpoint.active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-sunken color-muted'"
            :aria-label="`${breakpoint.label}: ${t(breakpoint.active ? 'debug.matched' : 'debug.unmatched')}`"
            :data-active="breakpoint.active"
          >
            {{ breakpoint.label }}
            <span v-if="breakpoint.active" class="i-ph:check inline-block align-middle" aria-hidden="true" />
          </span>
        </div>
      </LayoutCard>
      <div class="grid md:grid-cols-2 gap-4 items-start">
        <LayoutCard v-for="section in sections" :key="section.id" as="section" :aria-label="section.title" :padding="false" class="min-w-0 overflow-hidden">
          <details open>
            <summary class="cursor-pointer p-4 text-sm font-semibold select-none focus-visible:outline-primary">
              <span :class="[section.icon, section.color]" class="inline-block align-middle mx-1" aria-hidden="true" />
              {{ section.title }}
            </summary>
            <VDCodeBlock :code="JSON.stringify(section.value, null, 2) ?? ''" lang="json" />
          </details>
        </LayoutCard>
      </div>
    </template>
  </div>
</template>
