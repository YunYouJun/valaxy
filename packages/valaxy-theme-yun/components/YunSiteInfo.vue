<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="site-info gap-1 items-center" flex="~ col" p="t-8">
    <RouterLink
      class="site-author-avatar inline-flex-center" to="/about"
    >
      <YunAuthorAvatar />
    </RouterLink>
    <YunAuthorName />
    <YunSiteTitle />
    <h4
      v-if="siteConfig.subtitle"
      class="site-subtitle block"
      text="xs"
    >
      {{ siteConfig.subtitle }}
    </h4>
    <div v-if="siteConfig.description" class="site-description">
      {{ siteConfig.description }}
    </div>
  </div>
</template>

<style lang="scss">
.site-info {
  &.fix-top {
    margin-top: -1.5rem;
  }
}
</style>
