<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { useI18n } from 'vue-i18n'

const siteConfig = useSiteConfig()
const { t } = useI18n()
</script>

<template>
  <div v-if="siteConfig.author.intro" class="site-author-intro" m="t-0 b-4">
    {{ t(siteConfig.author.intro) }}
  </div>
</template>
