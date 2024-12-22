<script setup lang="ts">
import type { ExcerptType } from 'valaxy'
import SelectButton from 'primevue/selectbutton'
import { ref, watch } from 'vue'

const excerptType = defineModel<ExcerptType>('excerptType', {
  default: 'ai',
})

const options = ref<{
  icon: string
  value: ExcerptType
}[]>([
  { icon: 'i-ri-robot-line', value: 'ai' },
  { icon: 'i-vscode-icons:file-type-html', value: 'html' },
  { icon: 'i-vscode-icons:file-type-markdown', value: 'md' },
  { icon: 'i-vscode-icons:file-type-text', value: 'text' },
])

const curOption = ref(options.value.find(o => o.value === excerptType.value))
watch(() => excerptType.value, (val) => {
  curOption.value = options.value.find(o => o.value === val)
})

function onChange(e: {
  value: {
    icon: string
    value: ExcerptType
  }
}) {
  excerptType.value = e.value.value
}
</script>

<template>
  <div class="inline-flex gap-1 items-center justify-center">
    <!-- <div v-if="excerptType === 'ai'" class="i-ri-robot-line" />
    <div v-if="excerptType === 'html'" class="i-vscode-icons:file-type-html" />
    <div v-if="excerptType === 'md'" class="i-vscode-icons:file-type-markdown" />
    <div v-if="excerptType === 'txt'" class="i-vscode-icons:file-type-text" />
    <div>
      {{ excerptType }}
    </div> -->

    <SelectButton :model-value="curOption" :options="options" option-label="value" data-key="value" size="small" @change="onChange">
      <template #option="slotProps">
        <i :class="slotProps.option.icon" />
        <span class="text-sm">
          {{ slotProps.option.value }}
        </span>
      </template>
    </SelectButton>
  </div>
</template>
