<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { useYunAppStore } from '../stores'

// sidebar config
const app = useAppStore()
const yun = useYunAppStore()
</script>

<template>
  <div v-if="!yun.isStrato" class="inline-flex items-center justify-center gap-1">
    <YunToggleDark />

    <YunToggleLocale v-if="app.showToggleLocale" />
  </div>
</template>
