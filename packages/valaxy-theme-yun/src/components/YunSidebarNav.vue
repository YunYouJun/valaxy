<template>
  <nav class="site-nav" text-xl mt-6>
    <router-link class="site-link-item yun-icon-btn" to="/" :title="t('menu.home')">
      <div i-ri-home-4-line />
    </router-link>

    <router-link class="site-link-item" to="/archive/" :title="t('menu.archives')">
      <div class="icon" i-ri-archive-line />
      <span class="count">{{ 0 }}</span>
    </router-link>
    <router-link class="site-link-item" to="/categories/" :title="t('menu.categories')">
      <div class="icon" i-ri-folder-2-line />
      <span class="count">{{ 0 }}</span>
    </router-link>
    <router-link class="site-link-item" to="/tags/" :title="t('menu.tags')">
      <div class="icon" i-ri-price-tag-3-line />
      <span class="count">{{ 10 }}</span>
    </router-link>

    <router-link class="site-link-item yun-icon-btn" to="/about" :title="t('button.about')">
      <div i-ri-clipboard-line />
    </router-link>
  </nav>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style lang="scss">
@use "~/styles/mixins" as *;

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

  color: var(--yun-c-text);

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
    color: var(--yun-c-text);
    font-family: var(--yun-font-sans);
    display: block;
    text-align: center;
    font-size: 1rem;
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;

    &:hover {
      color: var(--yun-c-primary-light);
    }
  }
}
</style>
