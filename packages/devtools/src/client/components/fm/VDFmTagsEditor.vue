<script lang="ts" setup>
import { ref } from 'vue'

const tags = defineModel<string[]>({ default: () => [] })

const newTag = ref('')

function addTag() {
  const tag = newTag.value.trim()
  if (tag && !tags.value.includes(tag)) {
    tags.value = [...tags.value, tag]
  }
  newTag.value = ''
}

function removeTag(index: number) {
  tags.value = tags.value.filter((_, i) => i !== index)
}
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <div class="flex flex-wrap gap-1.5">
      <VDTag
        v-for="(tag, index) in tags"
        :key="tag"
        removable
        @remove="removeTag(index)"
      >
        {{ tag }}
      </VDTag>
    </div>
    <VDInput
      v-model="newTag"
      size="sm"
      placeholder="Add tag..."
      class="w-full"
      @keydown.enter.prevent="addTag"
    />
  </div>
</template>
