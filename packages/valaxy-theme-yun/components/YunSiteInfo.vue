<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'

const siteConfig = useSiteConfig()
</script>

<template>
  <div class="site-info gap-1 items-center" flex="~ col" m="t-4">
    <RouterLink
      class="site-author-avatar inline-flex-center" to="/about"
    >
      <img class="rounded-full" :src="siteConfig.author.avatar" alt="avatar">
      <!-- <span
        v-if="siteConfig.author.status.emoji"
        class="site-author-status absolute"
        :title="siteConfig.author.status.message || undefined"
      >{{ siteConfig.author.status.emoji }}</span> -->
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
.site-author-avatar {
  position: relative;
  line-height: 0;

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

.site-info {
  &.fix-top {
    margin-top: -1.5rem;
  }
}
</style>
