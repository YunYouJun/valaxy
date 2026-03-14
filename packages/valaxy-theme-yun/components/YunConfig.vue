<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { useYunAppStore } from '../stores'

// sidebar config
const app = useAppStore()
const yun = useYunAppStore()
</script>

<template>
  <div v-if="!yun.isStrato">
    <YunToggleDark />

    <YunToggleLocale v-if="app.showToggleLocale" />
  </div>
</template>
