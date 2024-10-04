<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="site-info" m="t-6">
    <RouterLink class="site-author-avatar" to="/about">
      <img class="rounded-full" :src="siteConfig.author.avatar" alt="avatar">
      <span v-if="siteConfig.author.status.emoji" class="site-author-status" :title="siteConfig.author.status.message || undefined">{{ siteConfig.author.status.emoji }}</span>
    </RouterLink>
    <YunAuthorName />
    <YunSiteTitle />
    <h4 v-if="siteConfig.subtitle" class="site-subtitle block" text="xs">
      {{ siteConfig.subtitle }}
    </h4>
    <div v-if="siteConfig.description" class="site-description my-1">
      {{ siteConfig.description }}
    </div>
  </div>
</template>

<style lang="scss">
.site-author-avatar {
  display: inline-block;
  line-height: 0;
  position: relative;

  img {
    height: 96px;
    width: 96px;
    max-width: 100%;
    margin: 0;
    padding: 4px;
    background-color: white;
    box-shadow: 0 0 10px rgba(black, 0.2);
    transition: 0.4s;

    &:hover {
      box-shadow: 0 0 30px rgba(var(--va-c-primary-rgb), 0.2);
    }
  }
}

.site-info {
  &.fix-top {
    margin-top: -1.5rem;
  }
}
</style>
