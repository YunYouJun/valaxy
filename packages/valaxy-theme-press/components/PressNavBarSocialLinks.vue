<script lang="ts" setup>
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
</script>

<template>
  <PressSocialLinks
    v-if="localeConfig.socialLinks"
    class="pr-nav-bar-social-links"
    :links="localeConfig.socialLinks"
  />
</template>

<style scoped>
.pr-nav-bar-social-links {
  display: none;
}

@media (width >= 1280px) {
  .pr-nav-bar-social-links {
    display: flex;
    align-items: center;
  }
}
</style>
