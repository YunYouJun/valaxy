<script setup lang="ts">
import FeedbackTip from '@antfu/design/components/Feedback/FeedbackTip.vue'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  severity?: 'success' | 'error' | 'warn' | 'info'
  closable?: boolean
}>()

const visible = ref(true)
const { t } = useI18n()
</script>

<template>
  <FeedbackTip
    v-if="visible"
    :type="severity === 'warn' ? 'warning' : severity || 'info'"
    icon="i-ph:info"
  >
    <div class="flex items-start gap-2">
      <div class="flex-1 min-w-0">
        <slot />
      </div>
      <button v-if="closable" type="button" class="btn-icon-compact shrink-0" :aria-label="t('button.close')" @click="visible = false">
        <span class="i-ph:x" aria-hidden="true" />
      </button>
    </div>
  </FeedbackTip>
</template>
