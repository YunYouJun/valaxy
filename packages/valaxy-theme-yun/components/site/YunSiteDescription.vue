<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

const siteConfig = useSiteConfig()
const { t } = useI18n()
</script>

<template>
  <div v-if="siteConfig.description" class="site-description text-$va-c-text text-sm">
    {{ t(siteConfig.description) }}
  </div>
</template>
