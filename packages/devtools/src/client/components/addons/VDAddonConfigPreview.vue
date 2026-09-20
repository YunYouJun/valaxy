<script setup lang="ts">
import type { AddonOperationPlan } from '../../../shared/addons'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import VDCodeBlock from '../VDCodeBlock.vue'

const props = defineProps<{ plan: AddonOperationPlan }>()
const { t } = useI18n()
const wrap = ref(true)
const language = computed(() => /\.[cm]?js$/i.test(props.plan.configFile || '') ? 'js' : 'ts')
const filename = computed(() => props.plan.configFile?.split(/[\\/]/).pop())
</script>

<template>
  <details class="vd-addon-config">
    <summary class="cursor-pointer font-medium">
      {{ t('addons.config_changes') }}
    </summary>
    <div class="flex flex-wrap items-center justify-between gap-2 my-3 text-xs">
      <span class="inline-flex items-center gap-2 min-w-0" :title="plan.configFile">
        <span class="i-ph:file-code color-muted shrink-0" aria-hidden="true" />
        <span class="font-mono break-all">{{ filename }}</span>
      </span>
      <label class="inline-flex items-center gap-2 cursor-pointer color-muted">
        <input v-model="wrap" type="checkbox" class="accent-primary-500">
        {{ t('addons.wrap_code') }}
      </label>
    </div>
    <div class="grid gap-3 md:grid-cols-2">
      <section v-for="(code, index) in [plan.configBefore, plan.configAfter]" :key="index" class="min-w-0 rounded border border-base overflow-hidden">
        <h4 class="text-xs font-medium px-3 py-2 border-b border-base bg-secondary">
          {{ t(index === 0 ? 'addons.before' : 'addons.after') }}
        </h4>
        <VDCodeBlock :code="code ?? ''" :lang="language" :wrap="wrap" compact />
      </section>
    </div>
  </details>
</template>
