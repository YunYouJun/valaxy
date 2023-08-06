<script lang="ts" setup>
defineProps<{
  title: string
  count: number
}>()
</script>

<template>
  <span
    inline-flex my="2" p="1"
    class="post-tag cursor-pointer items-baseline leading-4"
  >
    <span inline-flex>#{{ title }}</span>
    <span inline-flex text="xs">[{{ count }}]</span>
  </span>
</template>
