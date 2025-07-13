<script setup lang="ts">
import { useSiteConfig, useValaxyI18n } from 'valaxy'

const siteConfig = useSiteConfig()
const { $t } = useValaxyI18n()
</script>

<template>
  <RouterLink
    class="site-author-name font-black font-serif text-$va-c-text op-80 hover:op-100 flex-center"
    to="/about"
  >
    {{ $t(siteConfig.author.name) }}
  </RouterLink>
</template>
