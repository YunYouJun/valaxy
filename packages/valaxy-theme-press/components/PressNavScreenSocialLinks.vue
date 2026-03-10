<script lang="ts" setup>
import { useLocaleConfig } from '../composables'

const { localeConfig } = useLocaleConfig()
</script>

<template>
  <PressSocialLinks
    v-if="localeConfig.socialLinks"
    class="pr-nav-screen-social-links"
    :links="localeConfig.socialLinks"
  />
</template>
