<script setup lang="ts">
// layout
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <YunLayoutWrapper>
      <YunLayoutLeft />
      <RouterView />
      <YunLayoutRight />
    </YunLayoutWrapper>

    <YunFooter />
  </div>
</template>
