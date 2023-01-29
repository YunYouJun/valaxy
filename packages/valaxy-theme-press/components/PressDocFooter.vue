<script lang="ts" setup>
import { useEditLink } from '../composables'

const editLink = useEditLink()
</script>

<template>
  <div flex justify="between" text="sm">
    <a flex items="center" :href="editLink.url" target="_blank">
      <div i-ri-external-link-line />
      <span ml-1>{{ editLink.text }}</span>
    </a>
    <PressDocFooterLastUpdated />
  </div>
</template>
