<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <img
    class="rounded-full size-full"
    :src="siteConfig.author.avatar" alt="avatar"
  >
</template>
