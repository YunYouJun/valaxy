<script lang="ts" setup>
import { useSiteConfig } from 'valaxy'
import { useRouter } from 'vue-router'

const siteConfig = useSiteConfig()
const router = useRouter()
</script>

<template>
  <div class="sidebar-panel">
    <div class="site-info" m="t-6">
      <router-link class="site-author-avatar" to="/about">
        <img class="rounded-full" :src="siteConfig.author.avatar" alt="avatar">
        <span class="site-author-status">{{ siteConfig.author.status.emoji }}</span>
      </router-link>
      <div class="site-author-name">
        <router-link to="/about">
          {{ siteConfig.author.name }}
        </router-link>
      </div>
      <router-link v-if="router.hasRoute('about-site')" to="/about/site" class="site-name">
        {{ siteConfig.title }}
      </router-link>
      <span v-else class="site-name">{{ siteConfig.title }}</span>
      <h4 v-if="siteConfig.subtitle" class="site-subtitle block" text="xs">
        {{ siteConfig.subtitle }}
      </h4>
      <div v-if="siteConfig.description" class="site-description my-1">
        {{ siteConfig.description }}
      </div>
    </div>

    <YunSidebarNav />
    <hr m="t-4 b-2">
    <YunSocialLinks />
    <hr m="y-2">
    <YunSidebarLinks />
    <br>
  </div>

  <YunConfig />
</template>

<style lang="scss">
@use "valaxy/client/styles/mixins/index.scss" as *;

.sidebar-panel {
  padding: 0.5rem;
}

.site-info {
  &.fix-top {
    margin-top: -1.5rem;
  }
}

.site-author-avatar {
  display: inline-block;
  line-height: 0;
  position: relative;

  img {
    height: 96px;
    width: 96px;
    max-width: 100%;
    margin: 0px;
    padding: 4px;
    background-color: white;
    box-shadow: 0 0 10px rgba(black, 0.2);
    transition: 0.4s;

    &:hover {
      box-shadow: 0 0 30px rgba(var(--va-c-primary-rgb), 0.2);
    }
  }
}

.site-author-name {
  margin-top: 0;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.site-author-status {
  position: absolute;
  height: 1.8rem;
  width: 1.8rem;
  bottom: 0;
  right: 0;
  line-height: 1.8rem;
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  background-color: var(--va-c-bg-light);

  border: 1px solid rgba(255, 255, 255, 0.1);
}

.site-name {
  color: var(--va-c-text);
  font-family: get-css-var('font-serif');
  font-weight: 900;
}

.site-subtitle {
  color: get-css-var('c-gray');
  display: block;
}

.site-description {
  color: var(--va-c-text);
  font-size: 0.8rem;
}
</style>
