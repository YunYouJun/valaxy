<script setup lang="ts">
import { computed } from 'vue'
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()

const infoList = computed(() => {
  return [
    {
      label: 'xs',
      value: yun.size.isXs,
    },
    {
      label: 'sm',
      value: yun.size.isSm,
    },
    {
      label: 'md',
      value: yun.size.isMd,
    },
    {
      label: 'lg',
      value: yun.size.isLg,
    },
    {
      label: 'xl',
      value: yun.size.isXl,
    },
    {
      label: '2xl',
      value: yun.size.is2xl,
    },
  ]
})
</script>

<template>
  <div
    class="bg-black/50 fixed bottom-20 left-2 p-2 gap-1 rounded z-9999"
    text="xs white" flex="~ col"
  >
    <div v-for="item in infoList" :key="item.label" class="gap-2 inline-flex">
      <span class="w-6" font="bold">{{ item.label }}: </span>
      <span>{{ item.value ? '✅' : '❌' }}</span>
    </div>
  </div>
</template>
