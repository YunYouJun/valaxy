<script setup lang="ts">
import LayoutCard from '@antfu/design/components/Layout/LayoutCard.vue'
import { useI18n } from 'vue-i18n'
import { extensions } from '../stores/app'
import { identityColor } from '../utils/colors'

const { t } = useI18n()
</script>

<template>
  <div class="h-full overflow-auto p-4 sm:p-6 bg-secondary">
    <h1 class="text-lg font-medium mb-2">
      {{ t('extensions.title') }}
    </h1>
    <p class="text-sm color-muted mb-5">
      {{ t('extensions.panels_hint') }}
    </p>
    <div class="grid gap-3 sm:grid-cols-2 max-w-5xl">
      <LayoutCard v-for="plugin in extensions.plugins" :key="plugin.id">
        <h2 class="flex items-center gap-2 font-medium mb-2">
          <span class="i-ph:puzzle-piece vd-accent" :style="identityColor(plugin.id)" />{{ plugin.name }}
        </h2>
        <div class="text-xs color-muted mb-3">
          {{ t('extensions.contributions', { fields: plugin.fields.length, actions: plugin.actions.length }) }}
        </div>
        <div class="flex gap-2 flex-wrap">
          <a v-for="panel in plugin.panels" :key="panel.id" :href="panel.url" target="_blank" rel="noopener" class="btn-action gap-2">
            {{ panel.title }}<span class="i-ph:arrow-square-out" aria-hidden="true" />
          </a>
        </div>
      </LayoutCard>
    </div>
  </div>
</template>
