<script setup lang="ts">
import type { ValaxyEditorActionResult, ValaxyEditorField } from '../../shared/extensions'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { getClient } from '../rpc'
import { clientPageData, extensions } from '../stores/app'
import { identityColor } from '../utils/colors'

const draft = defineModel<Record<string, any>>({ required: true })
const { t } = useI18n()
const plugins = computed(() => extensions.value.plugins.filter(plugin => plugin.fields.length || plugin.actions.length))
const presentFields = computed(() => new Set(Object.keys(draft.value)))
const running = ref('')
const result = ref<ValaxyEditorActionResult>()
watch(draft, () => {
  result.value = undefined
}, { deep: true })

function addField(field: ValaxyEditorField) {
  draft.value[field.key] = field.type === 'boolean' ? false : field.type === 'number' ? field.min ?? 0 : field.type === 'select' ? field.options[0].value : ''
}

async function runAction(id: string) {
  if (running.value || !clientPageData.value)
    return
  running.value = id
  result.value = undefined
  const snapshot = JSON.stringify(draft.value)
  try {
    const response = await (await getClient()).call('valaxy:run-editor-action', id, clientPageData.value.filePath, JSON.parse(snapshot))
    result.value = snapshot === JSON.stringify(draft.value) ? response : { severity: 'info', message: t('extensions.draft_changed') }
  }
  catch (error) {
    result.value = { severity: 'error', message: String(error) }
  }
  finally {
    running.value = ''
  }
}
</script>

<template>
  <div v-if="plugins.length" class="flex flex-col gap-4 mt-4">
    <fieldset v-for="plugin in plugins" :key="plugin.id" class="border border-base rounded-lg p-3">
      <legend class="flex items-center gap-1.5 px-2 text-xs font-semibold vd-accent" :style="identityColor(plugin.id)">
        <span class="i-ph:puzzle-piece" />{{ plugin.name }}
      </legend>
      <div v-for="field in plugin.fields" :key="field.key" class="flex flex-col gap-1.5 mb-3 text-sm">
        <div class="flex items-center gap-2">
          <label :id="`extension-${field.key}`" class="color-muted flex-1">{{ field.label }}</label>
          <VDButton v-if="presentFields.has(field.key)" variant="ghost" :aria-label="`${t('extensions.remove_field')}: ${field.label}`" @click="delete draft[field.key]">
            {{ t('extensions.remove_field') }}
          </VDButton>
          <VDButton v-else variant="ghost" :aria-label="`${t('extensions.add_field')}: ${field.label}`" @click="addField(field)">
            {{ t('extensions.add_field') }}
          </VDButton>
        </div>
        <template v-if="presentFields.has(field.key)">
          <VDTextarea v-if="field.type === 'textarea'" v-model="draft[field.key]" :aria-labelledby="`extension-${field.key}`" :maxlength="field.maxLength" />
          <VDCheckbox v-else-if="field.type === 'boolean'" v-model="draft[field.key]" :aria-labelledby="`extension-${field.key}`" />
          <VDNumberField v-else-if="field.type === 'number'" v-model="draft[field.key]" :min="field.min" :max="field.max" :step="field.step" :aria-labelledby="`extension-${field.key}`" />
          <VDSelect v-else-if="field.type === 'select'" v-model="draft[field.key]" :options="field.options" :aria-labelledby="`extension-${field.key}`" />
          <VDInput v-else v-model="draft[field.key]" :maxlength="field.maxLength" :aria-labelledby="`extension-${field.key}`" />
        </template>
        <p v-if="field.description" class="color-faint text-xs">
          {{ field.description }}
        </p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <VDButton v-for="action in plugin.actions" :key="action.id" variant="secondary" :loading="running === action.id" :disabled="!!running" @click="runAction(action.id)">
          {{ action.label }}
        </VDButton>
      </div>
    </fieldset>
    <VDMessage v-if="result" :severity="result.severity || 'info'" role="status">
      {{ result.message }}
    </VDMessage>
  </div>
</template>
