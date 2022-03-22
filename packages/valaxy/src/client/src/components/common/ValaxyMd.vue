<script lang="ts" setup>
defineProps<{
  frontmatter: any
}>()
</script>

<template>
  <main class="markdown-body" text="left" m="auto" p="y-4" w="900px">
    <article w="full">
      <slot />
    </article>
  </main>
</template>
