<script lang="ts" setup>
import { useSiteConfig, useValaxyI18n } from 'valaxy'

const { $t } = useValaxyI18n()
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
      v-if="$t(siteConfig.subtitle)"
      class="site-subtitle block"
      text="xs"
    >
      {{ $t(siteConfig.subtitle) }}
    </h4>
    <div v-if="siteConfig.description" class="site-description">
      {{ $t(siteConfig.description) }}
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
