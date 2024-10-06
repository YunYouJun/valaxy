<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <h4
    v-if="siteConfig.subtitle"
    class="site-subtitle block text-$va-c-text op-80" text="sm"
  >
    {{ siteConfig.subtitle }}
  </h4>
</template>
