<script setup lang="ts">
import LayoutCard from '@antfu/design/components/Layout/LayoutCard.vue'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAddonManager } from '../../composables/addons'
import { connectionStatus } from '../../rpc'
import { extensions } from '../../stores/app'

const { t } = useI18n()
const { cards, inventory, loading, error, selected, details, detailError, detailLoading, plan, actionError, pending, running, refresh, select, loadDetails, prepare, apply } = useAddonManager()
const query = shallowRef('')
const view = shallowRef('discover')
const kind = shallowRef('all')
const tag = shallowRef('')
const tags = computed(() => [...new Set(cards.value.flatMap(card => card.tags || []))].sort())
const visible = computed(() => {
  const search = query.value.trim().toLowerCase()
  return cards.value.filter(card => (view.value !== 'installed' || card.installed)
    && (kind.value === 'all' || card.kind === kind.value)
    && (!tag.value || card.tags?.includes(tag.value))
    && (!search || [card.name, card.description, ...(card.author || []), ...(card.tags || [])].join(' ').toLowerCase().includes(search)))
})
const currentSelection = computed(() => cards.value.find(card => card.name === selected.value?.name))
const canManage = computed(() => inventory.value.packageManager === 'pnpm' && connectionStatus.value === 'connected')
</script>

<template>
  <main class="h-full overflow-auto p-4 sm:p-6 bg-secondary">
    <div class="max-w-6xl mx-auto">
      <header class="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 class="text-xl font-semibold">
            {{ t('addons.title') }}
          </h1>
          <p class="text-sm color-muted mt-2 max-w-2xl">
            {{ t('addons.description') }}
          </p>
        </div>
        <VDButton variant="secondary" :loading="loading" @click="refresh">
          {{ t('addons.refresh') }}
        </VDButton>
      </header>
      <p v-if="error" role="alert" class="text-sm text-red-600 mb-4 break-words">
        {{ error }}
      </p>
      <p v-if="inventory.managementError" class="text-sm color-muted mb-4">
        {{ inventory.managementError }}
      </p>
      <VDAddonOperation v-if="inventory.operation" :operation="inventory.operation" />
      <VDAddonFilters v-model:query="query" v-model:view="view" v-model:kind="kind" v-model:tag="tag" :count="inventory.installed.length" :tags="tags" />
      <p class="text-xs color-muted mb-3" role="status">
        {{ t('addons.results', { count: visible.length }) }}
      </p>
      <div v-if="visible.length" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <VDAddonCard v-for="addon in visible" :key="addon.name" :addon="addon" @select="select" />
      </div>
      <div v-else class="border border-dashed border-base rounded-xl py-14 text-center color-muted">
        <span class="i-ph:puzzle-piece text-3xl mb-3" aria-hidden="true" />
        <p>{{ t(view === 'installed' && !query ? 'addons.empty_installed' : 'addons.no_results') }}</p>
      </div>
      <section v-if="extensions.plugins.length" class="mt-8">
        <h2 class="font-medium mb-2">
          {{ t('addons.panels') }}
        </h2>
        <p class="text-sm color-muted mb-4">
          {{ t('extensions.panels_hint') }}
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <LayoutCard v-for="plugin in extensions.plugins" :key="plugin.id">
            <h3 class="font-medium mb-2">
              {{ plugin.name }}
            </h3>
            <p class="text-xs color-muted mb-3">
              {{ t('extensions.contributions', { fields: plugin.fields.length, actions: plugin.actions.length }) }}
            </p>
            <div class="flex flex-wrap gap-2">
              <a v-for="panel in plugin.panels" :key="panel.id" :href="panel.url" target="_blank" rel="noopener noreferrer" class="btn-action">{{ panel.title }} ↗</a>
            </div>
          </LayoutCard>
        </div>
      </section>
      <VDAddonDialog
        v-if="currentSelection" :addon="currentSelection" :details="details" :plan="plan" :error="actionError" :detail-error="detailError" :detail-loading="detailLoading"
        :pending="pending" :running="running" :can-manage="canManage" :config-file="inventory.configFile"
        @close="select()" @retry="loadDetails" @prepare="prepare" @apply="apply"
      />
    </div>
  </main>
</template>
