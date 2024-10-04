<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div
    class="site-author-name leading-6"
    m="t-0"
  >
    <RouterLink to="/about">
      {{ siteConfig.author.name }}
    </RouterLink>
  </div>
</template>
