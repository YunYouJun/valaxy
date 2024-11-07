<script lang="ts" setup>
import { useAppStore } from 'valaxy'

// sidebar config
const app = useAppStore()
</script>

<template>
  <div>
    <YunToggleDark />

    <YunToggleLocale v-if="app.showToggleLocale" />
  </div>
</template>
