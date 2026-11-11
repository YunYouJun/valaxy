<script setup lang="ts">
import { computed, ref } from 'vue'

const message = ref('Server-rendered excerpt')
const template = ref('<p data-testid="compiled-message">{{ message }}</p><button data-testid="compiled-counter" @click="count++">Count: {{ count }}</button>')
const data = computed(() => ({ message: message.value, count: 0 }))
</script>

<template>
  <main p-6 pt-24>
    <ValaxyDynamicComponent :template-str="template" :data="data" />
    <button @click="message = 'Updated template data'">
      Update template data
    </button>
    <button @click="template = '<strong data-testid=&quot;compiled-message&quot;>{{ message }}!</strong>'">
      Replace template
    </button>
    <button @click="template = ''">
      Clear template
    </button>
  </main>
</template>

<route lang="json">
{
  "meta": {
    "layout": false,
    "frontmatter": {
      "title": "Dynamic template loading",
      "hide": true
    }
  }
}
</route>
