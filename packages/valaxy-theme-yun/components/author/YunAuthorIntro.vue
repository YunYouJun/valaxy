<script setup lang="ts">
import { useSiteConfig, useValaxyI18n } from 'valaxy'

const siteConfig = useSiteConfig()
const { $t } = useValaxyI18n()
</script>

<template>
  <div v-if="siteConfig.author.intro" class="site-author-intro" m="t-0 b-4">
    {{ $t(siteConfig.author.intro) }}
  </div>
</template>
