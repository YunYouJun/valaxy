<script lang="ts" setup>
import { useCategory, usePostList, useTag } from 'valaxy'
import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../composables'

const { t } = useI18n()

const themeConfig = useThemeConfig()
const posts = usePostList()
const categories = useCategory()
const tags = useTag()
</script>

<template>
  <nav class="site-nav" text-xl mt-6>
    <router-link class="site-link-item yun-icon-btn" to="/" :title="t('menu.home')">
      <div i-ri-home-4-line />
    </router-link>

    <router-link class="site-link-item" to="/archives/" :title="t('menu.archives')">
      <div class="icon" i-ri-archive-line />
      <span class="count">{{ posts.length }}</span>
    </router-link>
    <router-link class="site-link-item" to="/categories/" :title="t('menu.categories')">
      <div class="icon" i-ri-folder-2-line />
      <span class="count">{{ Array.from(categories.children).length }}</span>
    </router-link>
    <router-link class="site-link-item" to="/tags/" :title="t('menu.tags')">
      <div class="icon" i-ri-price-tag-3-line />
      <span class="count">{{ Array.from(tags).length }}</span>
    </router-link>

    <router-link class="site-link-item yun-icon-btn" :to="themeConfig.menu.custom.url" :title="t(themeConfig.menu.custom.title)">
      <div :class="themeConfig.menu.custom.icon" />
    </router-link>
  </nav>
</template>

<style lang="scss">
@use "valaxy/client/styles/mixins" as *;

.site-nav {
  display: flex;
  justify-content: center;
  overflow: hidden;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
  margin-top: 1rem;
}

.site-link-item {
  display: flex;
  padding: 0 15px;
  align-items: center;
  border-left: 1px solid get-css-var('c-gray');

  flex-direction: column;

  color: var(--va-c-text);

  &:first-child, &:last-child {
    line-height: 1;
    padding: 0;
  }

  &:first-child {
    border-left: none;
    border-right: 1px solid get-css-var('c-gray');
  }

  &:last-child {
    border-left: 1px solid get-css-var('c-gray');
  }

  &:nth-child(2) {
    border: none;
  }

  .count {
    color: var(--va-c-text);
    font-family: var(--va-font-sans);
    display: block;
    text-align: center;
    font-size: 1rem;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;

    &:hover {
      color: var(--va-c-primary-light);
    }
  }
}
</style>
