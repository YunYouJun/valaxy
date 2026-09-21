<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { rpc } from '../rpc'
import { contentDrafts } from '../stores/content-drafts'

const props = defineProps<{
  /** Absolute path of the selected Markdown file. */
  filePath: string
}>()
const { t } = useI18n()
const busy = shallowRef(false)
const message = shallowRef('')
const error = shallowRef('')
const confirmReload = shallowRef(false)
const draft = computed(() => contentDrafts.get(props.filePath))
const dirty = computed(() => draft.value?.content !== draft.value?.baseline)

async function load() {
  confirmReload.value = false
  busy.value = true
  error.value = ''
  try {
    const result = await rpc.getPostContent(props.filePath)
    contentDrafts.set(props.filePath, { ...result, baseline: result.content })
    message.value = ''
  }
  catch (e) { error.value = String(e) }
  finally { busy.value = false }
}

async function reload() {
  if (dirty.value)
    confirmReload.value = true
  else
    await load()
}

async function save() {
  if (!draft.value || busy.value)
    return
  busy.value = true
  error.value = ''
  const current = draft.value
  const content = current.content
  try {
    const result = await rpc.updatePostContent({ filePath: props.filePath, content, revision: current.revision })
    current.baseline = content
    current.revision = result.revision
    message.value = t('content.saved')
  }
  catch (e) { error.value = String(e) }
  finally { busy.value = false }
}

onMounted(() => {
  if (!draft.value)
    void load()
})
</script>

<template>
  <section class="content-editor" @keydown.ctrl.s.prevent="save" @keydown.meta.s.prevent="save">
    <div class="content-toolbar">
      <span>{{ dirty ? t('content.unsaved') : t('content.title') }}</span>
      <VDButton variant="ghost" :disabled="busy" @click="reload">
        {{ t('content.reload') }}
      </VDButton>
    </div>
    <textarea v-if="draft" v-model="draft.content" :aria-label="t('content.title')" class="content-input" spellcheck="false" />
    <div v-if="confirmReload" role="alert" class="flex gap-2 items-center flex-wrap">
      <span>{{ t('content.discard') }}</span>
      <VDButton @click="load">
        {{ t('content.discard_action') }}
      </VDButton>
      <VDButton variant="ghost" @click="confirmReload = false">
        {{ t('button.back') }}
      </VDButton>
    </div>
    <p v-if="error" role="alert" class="text-error-700 dark:text-error-300">
      {{ error }}
    </p>
    <p v-else-if="message" role="status">
      {{ message }}
    </p>
    <VDButton :disabled="busy || !draft || !dirty" @click="save">
      {{ t('content.save') }}
    </VDButton>
  </section>
</template>

<style scoped>
.content-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
}

.content-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
}

.content-input {
  width: 100%;
  min-height: 420px;
  resize: vertical;
  padding: 14px;
  font: 13px/1.8 ui-monospace, monospace;
  color: inherit;
  background: transparent;
  border: 1px solid color-mix(in srgb, currentcolor 20%, transparent);
  border-radius: 6px;
}

.content-input:focus {
  outline: 2px solid var(--devframe-primary, #3674bd);
  outline-offset: 2px;
}
</style>
