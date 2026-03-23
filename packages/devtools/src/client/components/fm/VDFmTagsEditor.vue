<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  /** All available tag suggestions (e.g. from existing posts) */
  suggestions?: string[]
}>(), {
  placeholder: 'Add tag...',
  suggestions: () => [],
})

const tags = defineModel<string[]>({ default: () => [] })

const newTag = ref('')
const showSuggestions = ref(false)
const inputEl = ref<HTMLInputElement>()

const filteredSuggestions = computed(() => {
  const q = newTag.value.trim().toLowerCase()
  return props.suggestions.filter(s =>
    !tags.value.includes(s) && (!q || s.toLowerCase().includes(q)),
  )
})

function addTag(tag?: string) {
  const t = (tag || newTag.value).trim()
  if (t && !tags.value.includes(t)) {
    tags.value = [...tags.value, t]
  }
  newTag.value = ''
  showSuggestions.value = false
}

function removeTag(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index)
}

function onFocus() {
  if (props.suggestions.length > 0)
    showSuggestions.value = true
}

function onBlur() {
  // Delay to allow click on suggestion
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

function selectSuggestion(s: string) {
  addTag(s)
  inputEl.value?.focus()
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div v-if="tags.length" class="flex flex-wrap gap-1">
      <VDTag
        v-for="(tag, index) in tags"
        :key="tag"
        removable
        @remove="removeTag(index)"
      >
        {{ tag }}
      </VDTag>
    </div>
    <div class="relative">
      <VDInput
        ref="inputEl"
        v-model="newTag"
        size="sm"
        :placeholder="placeholder"
        class="w-full"
        @keydown.enter.prevent="addTag()"
        @focus="onFocus"
        @blur="onBlur"
      />
      <div
        v-if="showSuggestions && filteredSuggestions.length > 0"
        class="absolute z-10 left-0 right-0 top-full mt-0.5 max-h-32 overflow-auto border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md shadow-lg"
      >
        <button
          v-for="s in filteredSuggestions"
          :key="s"
          class="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          @mousedown.prevent="selectSuggestion(s)"
        >
          # {{ s }}
        </button>
      </div>
    </div>
  </div>
</template>
