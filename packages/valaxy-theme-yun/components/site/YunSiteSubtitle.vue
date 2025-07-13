<script setup lang="ts">
import { useSiteConfig, useValaxyI18n } from 'valaxy'

const { $t } = useValaxyI18n()
const siteConfig = useSiteConfig()
</script>

<template>
  <h4
    v-if="siteConfig.subtitle"
    class="site-subtitle block text-$va-c-text op-80 font-medium" text="sm"
  >
    {{ $t(siteConfig.subtitle) }}
  </h4>
</template>
