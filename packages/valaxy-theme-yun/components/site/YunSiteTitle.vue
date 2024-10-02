<script setup lang="ts">
import { useSiteConfig } from 'valaxy'
import { useRouter } from 'vue-router'

const router = useRouter()
const siteConfig = useSiteConfig()
</script>

<template>
  <RouterLink v-if="router.hasRoute('/about/site')" to="/about/site" class="site-name">
    {{ siteConfig.title }}
  </RouterLink>
  <span v-else class="site-name">{{ siteConfig.title }}</span>
</template>
