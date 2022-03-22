<script lang="ts" setup>
defineProps<{
  frontmatter: any
}>()
</script>

<template>
  <main class="markdown-body" text="left" m="auto">
    <article>
      <slot />
    </article>
  </main>
</template>
