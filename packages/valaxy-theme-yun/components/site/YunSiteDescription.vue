<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div v-if="siteConfig.description" class="site-description text-$va-c-text text-sm">
    {{ siteConfig.description }}
  </div>
</template>
