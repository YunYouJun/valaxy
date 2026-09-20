<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { activeEditorPresentation, defaultEditorPresentation, editorChoices, editorPreference, openFileInEditor } from '../composables/editor'

const props = defineProps<{ file: string, label: string }>()
const { t } = useI18n()
const pending = ref(false)
const error = ref('')

async function open() {
  pending.value = true
  error.value = ''
  try {
    await openFileInEditor({ path: props.file })
  }
  catch (cause) {
    error.value = String(cause)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center gap-2">
      <button class="btn-action inline-flex items-center gap-2" :disabled="pending" :title="activeEditorPresentation?.name || t('editor.automatic')" @click="open">
        <span :class="pending ? 'i-ph:spinner animate-spin' : activeEditorPresentation?.icon || 'i-ph:code'" class="text-lg shrink-0" aria-hidden="true" />
        {{ label }}
      </button>
      <select v-model="editorPreference" :aria-label="t('editor.choose')" class="border border-base rounded px-2 py-1 text-xs bg-base max-w-full" :disabled="pending">
        <option value="">
          {{ t('editor.default', { name: defaultEditorPresentation?.name || t('editor.automatic') }) }}
        </option>
        <option v-for="editor in editorChoices" :key="editor.command" :value="editor.command">
          {{ editor.name }}
        </option>
      </select>
    </div>
    <p class="text-xs color-muted">
      {{ t('editor.hint') }}
    </p>
    <p v-if="error" role="alert" class="text-sm text-red-600 break-words">
      {{ error }}
    </p>
  </div>
</template>
