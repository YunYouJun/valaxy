<script setup lang="ts">
// layout
</script>

<template>
  <YunLayoutWrapper outline-nav author-notes>
    <YunLayoutLeft />
    <RouterView />
    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
