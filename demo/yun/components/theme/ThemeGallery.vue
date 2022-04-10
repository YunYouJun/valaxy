<script lang="ts" setup>
defineProps<{
  themes: {
    name: string
    repo: string
    desc: string
    tags?: string[]
  }[]
}>()
</script>

<template>
  <ul>
    <li v-for="theme, i in themes" :key="i">
      <a :href="'https://github.com/' + theme.repo" target="_blank">
        {{ theme.name }}
      </a>: {{ theme.desc }}
    </li>
  </ul>
</template>
