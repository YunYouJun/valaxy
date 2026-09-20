<script setup lang="ts">
import type { AddonOperation } from '../../../shared/addons'
import { useI18n } from 'vue-i18n'

defineProps<{ operation: AddonOperation }>()
const { t } = useI18n()
</script>

<template>
  <section class="mb-5 rounded-lg border border-base p-4" aria-live="polite" aria-atomic="false">
    <p class="font-medium flex items-center gap-2" role="status">
      <span :class="operation.status === 'running' ? 'i-ph:spinner animate-spin' : operation.status === 'succeeded' ? 'i-ph:check-circle' : 'i-ph:warning-circle'" aria-hidden="true" />
      {{ t(`addons.${operation.status}`) }} · {{ operation.name }}
    </p>
    <p v-if="operation.status === 'succeeded'" class="mt-2 text-sm color-muted">
      {{ t(operation.action === 'install' ? 'addons.installed_hint' : 'addons.removed_hint') }}
    </p>
    <p v-if="operation.error" role="alert" class="mt-2 text-sm text-red-600 break-words">
      {{ operation.error }}
    </p>
    <details v-if="operation.log" class="mt-2 text-sm" :open="operation.status === 'failed'">
      <summary class="cursor-pointer">
        {{ t('addons.logs') }}
      </summary>
      <pre class="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-all text-xs">{{ operation.log }}</pre>
    </details>
  </section>
</template>
