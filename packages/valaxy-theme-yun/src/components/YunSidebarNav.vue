<template>
  <nav class="site-nav" text-xl mt-6>
    <router-link class="site-link-item yun-icon-btn" to="/" :title="t('menu.home')">
      <div i-ri-home-4-line />
    </router-link>

    <router-link class="site-link-item icon-btn" to="/archive/" :title="t('menu.archives')">
      <div i-ri-archive-line />
    </router-link>
    <router-link class="site-link-item icon-btn" to="/categories/" :title="t('menu.categories')">
      <div i-ri-folder-2-line />
    </router-link>
    <router-link class="site-link-item icon-btn" to="/tags/" :title="t('menu.tags')">
      <div i-ri-price-tag-3-line />
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
}

.site-nav-item-icon {
  color: var(--yun-c-text);
  line-height: 1;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.site-nav-item-count {
  color: var(--yun-c-text);
  display: block;
  text-align: center;
  font-size: 1rem;
}
</style>
