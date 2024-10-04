<script setup lang="ts">
import { useYunAppStore } from '../../stores'

const yun = useYunAppStore()
</script>

<template>
  <div v-if="yun.size.isLg" flex="~ col" class="gap-4 sticky top-68px w-80">
    <YunSidebarCard />
    <YunAdBoard />
  </div>
</template>
