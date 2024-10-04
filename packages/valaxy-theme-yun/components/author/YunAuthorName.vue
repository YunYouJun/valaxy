<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <RouterLink class="site-author-name font-black font-serif text-$va-c-text" to="/about">
    {{ siteConfig.author.name }}
  </RouterLink>
</template>
