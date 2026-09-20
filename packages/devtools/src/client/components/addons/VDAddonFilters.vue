<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{ count: number, tags: string[] }>()
const query = defineModel<string>('query', { required: true })
const view = defineModel<string>('view', { required: true })
const kind = defineModel<string>('kind', { required: true })
const tag = defineModel<string>('tag', { required: true })
const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 mb-5">
    <div class="flex flex-wrap gap-2" :aria-label="t('addons.view')">
      <button v-for="value in ['discover', 'installed']" :key="value" class="btn-action" :class="view === value ? 'bg-primary-500/10 text-primary-600' : ''" :aria-pressed="view === value" @click="view = value">
        {{ t(`addons.${value}`) }}<span v-if="value === 'installed'" class="ml-2 text-xs tabular-nums">{{ count }}</span>
      </button>
    </div>
    <div class="flex flex-wrap gap-3">
      <input v-model="query" type="search" class="flex-1 min-w-45 border border-base rounded-lg px-3 py-2 text-sm bg-base focus:outline-primary-500" :placeholder="t('addons.search')" :aria-label="t('addons.search')">
      <select v-model="kind" class="border border-base rounded-lg px-3 py-2 text-sm bg-base focus:outline-primary-500" :aria-label="t('addons.source')">
        <option value="all">
          {{ t('addons.all_sources') }}
        </option>
        <option value="official">
          {{ t('addons.official') }}
        </option>
        <option value="community">
          {{ t('addons.community') }}
        </option>
      </select>
      <select v-model="tag" class="border border-base rounded-lg px-3 py-2 text-sm bg-base focus:outline-primary-500" :aria-label="t('addons.category')">
        <option value="">
          {{ t('addons.all_categories') }}
        </option>
        <option v-for="item in tags" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
    </div>
  </div>
</template>
