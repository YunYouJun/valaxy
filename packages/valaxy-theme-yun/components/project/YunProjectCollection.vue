<script lang="ts" setup>
import type { ProjectItem } from '../../types'

defineProps<{
  title: string
  emoji?: string
  projects: ProjectItem[]
}>()
</script>

<template>
  <section class="yun-project-collection">
    <header class="yun-project-collection-header">
      <h2 class="yun-project-collection-title">
        <span v-if="emoji" class="yun-project-collection-emoji" aria-hidden="true">{{ emoji }}</span>
        <span>{{ title }}</span>
      </h2>
      <span class="yun-project-collection-count">{{ projects.length }}</span>
      <span class="yun-project-collection-line" aria-hidden="true" />
    </header>
    <div class="yun-project-grid">
      <YunProjectCard v-for="project, i in projects" :key="project.name || i" :project="project" :i="i" />
    </div>
  </section>
</template>

<style scoped>
.yun-project-collection-header {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  margin-bottom: 1rem;
}

.yun-project-collection-title {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  color: var(--va-c-text);
  font-family: var(--va-font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.3;
}

.yun-project-collection-emoji {
  font-size: 1.125rem;
  line-height: 1;
}

.yun-project-collection-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.35rem;
  padding: 0 0.45rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: 999px;
  color: var(--va-c-text-2);
  background-color: color-mix(in srgb, var(--va-c-text) 3%, transparent);
  font-size: 0.75rem;
  font-weight: 600;
}

.yun-project-collection-line {
  flex: 1;
  height: 1px;
  background: var(--yun-surface-line);
}

.yun-project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  gap: 1rem;
}
</style>
