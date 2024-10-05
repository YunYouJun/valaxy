<script lang="ts" setup>
import type { ProjectItem } from '../../types'

defineProps<{
  title: string
  projects: ProjectItem[]
}>()
</script>

<template>
  <div class="w-full flex justify-center" text="xl" font="black" m="b-2 t-4">
    {{ title }}
  </div>
  <YunProjectCard v-for="project, i in projects" :key="i" :project="project" :i="i" />
</template>
