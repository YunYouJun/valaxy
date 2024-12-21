<script setup lang="ts">
import { useAppStore } from '../../stores/app'

const app = useAppStore()
</script>

<template>
  <MenuBarBtn @click="app.getDir">
    <div i-vscode-icons:default-root-folder-opened />
  </MenuBarBtn>
</template>
