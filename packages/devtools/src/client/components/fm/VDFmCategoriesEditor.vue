<script lang="ts" setup>
import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  /** All available category suggestions (e.g. from existing posts) */
  suggestions?: string[]
}>(), {
  placeholder: 'Add category...',
  suggestions: () => [],
})

const categories = defineModel<string | string[] | undefined>({ default: () => [] })

const normalizedCategories = computed(() => {
  if (!categories.value)
    return []
  if (typeof categories.value === 'string')
    return [categories.value]
  return categories.value
})

const newCategory = ref('')
const showSuggestions = ref(false)
const inputEl = ref<HTMLInputElement>()

const filteredSuggestions = computed(() => {
  const q = newCategory.value.trim().toLowerCase()
  const current = normalizedCategories.value
  return props.suggestions.filter(s =>
    !current.includes(s) && (!q || s.toLowerCase().includes(q)),
  )
})

function addCategory(cat?: string) {
  const c = (cat || newCategory.value).trim()
  const current = normalizedCategories.value
  if (c && !current.includes(c)) {
    categories.value = [...current, c]
  }
  newCategory.value = ''
  showSuggestions.value = false
}

function removeCategory(index: number) {
  categories.value = normalizedCategories.value.filter((_, i) => i !== index)
}

function onFocus() {
  if (props.suggestions.length > 0)
    showSuggestions.value = true
}

function onBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 150)
}

function selectSuggestion(s: string) {
  addCategory(s)
  inputEl.value?.focus()
}
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <div v-if="normalizedCategories.length" class="flex flex-wrap gap-1">
      <span
        v-for="(cat, index) in normalizedCategories"
        :key="cat"
        class="inline-flex items-center gap-0.5 rounded-full text-xs cursor-default transition bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-1"
      >
        <div class="i-ri:folder-2-line text-2.5 op-70" />
        {{ cat }}
        <button
          class="inline-flex items-center justify-center w-3.5 h-3.5 ml-0.5 rounded-full hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
          @click.stop="removeCategory(index)"
        >
          <div class="i-ri:close-line text-2.5" />
        </button>
      </span>
    </div>
    <div class="relative">
      <VDInput
        ref="inputEl"
        v-model="newCategory"
        size="sm"
        :placeholder="placeholder"
        class="w-full"
        @keydown.enter.prevent="addCategory()"
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
          class="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-600 dark:hover:text-green-400 cursor-pointer transition-colors flex items-center gap-1"
          @mousedown.prevent="selectSuggestion(s)"
        >
          <div class="i-ri:folder-2-line text-2.5 op-50" />
          {{ s }}
        </button>
      </div>
    </div>
  </div>
</template>
