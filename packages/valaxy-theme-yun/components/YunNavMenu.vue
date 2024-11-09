<script setup lang="ts">
import { useYunAppStore } from '../stores'

const yun = useYunAppStore()
</script>

<template>
  <YunStratoNavMenu v-if="yun.isStrato" />
  <YunNimboNavMenu v-else-if="yun.isNimbo" />
</template>
