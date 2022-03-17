<script setup lang="ts">
</script>

<template>
  <div>
    <YunCard>
      <a href="https://github.com/YunYouJun/valaxy" target="_blank">Valaxy</a> - 重新构想博客框架
    </YunCard>
    <YunCard v-for="i in 3" :key="i">
      Deving ... {{ i }}
    </YunCard>
  </div>
</template>

<route lang="yaml">
meta:
  layout: home
</route>
