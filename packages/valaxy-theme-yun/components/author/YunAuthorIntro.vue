<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="site-author-intro" m="t-0 b-4">
    {{ siteConfig.author.intro }}
  </div>
</template>
