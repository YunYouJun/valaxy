<script setup lang="ts">
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="relative yun-author-avatar">
    <img
      class="rounded-full size-full bg-white dark:bg-white/20 p-1 m-0"
      :src="siteConfig.author.avatar"
      alt="avatar"
    >
    <span
      v-if="siteConfig.author.status.emoji"
      class="site-author-status absolute"
      :title="siteConfig.author.status.message || undefined"
    >{{ siteConfig.author.status.emoji }}</span>
  </div>
</template>

<style lang="scss">
.yun-author-avatar {
  width: var(--avatar-size, 96px);
  height: var(--avatar-size, 96px);
}

.site-author-avatar {
  img {
    box-shadow: 0 0 10px rgba(black, 0.2);
    transition: 0.4s;

    &:hover {
      box-shadow: 0 0 30px rgba(var(--va-c-primary-rgb), 0.2);
    }
  }
}

.site-author-status {
  height: 1.8rem;
  width: 1.8rem;
  bottom: 0;
  right: 0;
  line-height: 1.8rem;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.2);
  background-color: var(--va-c-bg-light);
  border: 1px solid rgb(255 255 255 / 0.1);
}
</style>
