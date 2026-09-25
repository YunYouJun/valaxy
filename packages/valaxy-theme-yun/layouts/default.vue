<script setup lang="ts">
// layout
</script>

<template>
  <YunLayoutWrapper outline-nav>
    <YunLayoutLeft />
    <RouterView />
    <YunLayoutRight :floating-trigger="false" />
  </YunLayoutWrapper>
</template>
