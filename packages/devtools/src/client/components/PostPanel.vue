<script lang="ts" setup>
import { getWindowProperty, openInEditor } from '../utils'
import { frontmatter } from '../composables/app'

function launchEditor() {
  openInEditor({
    file: getWindowProperty('$pageData').path,
  })
}
</script>

<template>
  <div p="2">
    <div class="flex" gap="2" py-2>
      <button class="text-xs shadow transition hover:shadow-lg p-2" @click="launchEditor()">
        <div i-vscode-icons:file-type-vscode />
      </button>
    </div>

    <PageFrontmatter v-if="frontmatter" :frontmatter="frontmatter" />
  </div>
</template>
