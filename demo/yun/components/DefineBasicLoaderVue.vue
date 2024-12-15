<script setup lang="ts">
// @ts-expect-error not work
const pageData = usePageData()
</script>

<template>
  <div>
    PageData: {{ pageData }}
  </div>
</template>
