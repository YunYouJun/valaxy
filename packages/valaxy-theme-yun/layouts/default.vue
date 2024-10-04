<script setup lang="ts">
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()
</script>

<template>
  <div
    flex="~"
    class="mt-24 md:mt-36 w-full max-w-screen-2xl m-auto justify-center items-start gap-4"
    :class="{
      'flex-col': yun.size.isXs,
    }"
  >
    <YunLayoutLeft />
    <RouterView />
  </div>
  <YunFooter />
</template>
