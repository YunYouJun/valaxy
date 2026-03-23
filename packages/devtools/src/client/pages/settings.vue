<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { defaultSettings, settings } from '../stores/app'

const { t } = useI18n()

const sortOrderOptions = computed(() => [
  { label: t('settings.sort_order_updated'), value: 'updated' },
  { label: t('settings.sort_order_date'), value: 'date' },
  { label: t('settings.sort_order_title'), value: 'title' },
])

const sortDirectionOptions = computed(() => [
  { icon: 'i-ri:sort-desc', label: t('settings.sort_desc'), value: 'desc' },
  { icon: 'i-ri:sort-asc', label: t('settings.sort_asc'), value: 'asc' },
])

const densityOptions = computed(() => [
  { icon: 'i-ri:list-check', label: t('settings.density_compact'), value: 'compact' },
  { icon: 'i-ri:list-unordered', label: t('settings.density_comfortable'), value: 'comfortable' },
])

function resetSettings() {
  settings.value = { ...defaultSettings }
}
</script>

<template>
  <div class="h-full overflow-auto">
    <div class="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800">
      <h3 class="text-sm font-bold flex-1">
        {{ t('settings.title') }}
      </h3>
    </div>

    <div class="p-6 max-w-lg mx-auto w-full flex flex-col gap-5">
      <!-- Site URL -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium">{{ t('settings.site_url') }}</label>
        <p class="text-xs op-50">
          {{ t('settings.site_url_desc') }}
        </p>
        <VDInput
          v-model="settings.siteUrl"
          placeholder="http://localhost:4859"
          size="md"
        />
      </div>

      <!-- Sort Order -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium">{{ t('settings.sort_order') }}</label>
        <div class="flex items-center gap-2">
          <VDSelect
            v-model="settings.sortOrder"
            :options="sortOrderOptions"
            class="w-48"
          />
          <VDToggleGroup
            v-model="settings.sortDirection"
            :options="sortDirectionOptions"
          />
        </div>
      </div>

      <!-- List Density -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium">{{ t('settings.list_density') }}</label>
        <VDToggleGroup
          v-model="settings.listDensity"
          :options="densityOptions"
        />
      </div>

      <!-- Reset -->
      <div class="border-t border-gray-100 dark:border-gray-800 pt-4">
        <VDButton
          variant="secondary"
          size="sm"
          icon="i-ri:refresh-line"
          @click="resetSettings"
        >
          {{ t('settings.reset') }}
        </VDButton>
      </div>
    </div>
  </div>
</template>
