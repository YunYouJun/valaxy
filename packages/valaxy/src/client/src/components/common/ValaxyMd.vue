<script lang="ts" setup>
const props = defineProps<{
  frontmatter: any
}>()

console.log(props)
</script>

<template>
  <main class="markdown-body" text="left" m="auto" p="y-4" w="900px">
    <article w="full">
      <slot />
    </article>
  </main>
</template>
