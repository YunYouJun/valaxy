<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="links-of-author">
    <YunSocialLinkItem
      v-for="item, i in siteConfig.social" :key="i"
      :social="item"
    />
  </div>
</template>

<style lang="scss">
.links-of-author {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  &-item {
    line-height: 1;
    font-size: 0.9rem;
  }
}
</style>
