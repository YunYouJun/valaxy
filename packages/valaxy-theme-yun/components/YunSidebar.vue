<template>
  <div class="sidebar-panel">
    <div class="site-info" m="t-6">
      <a class="site-author-avatar">
        <img class="rounded-full" :src="config.author.avatar" alt="avatar">
        <span class="site-author-status">{{ config.author.status.emoji }}</span>
      </a>
      <div class="site-author-name">
        <a href="/about">
          {{ config.author.name }}
        </a>
      </div>
      <a href="/about/site" class="site-name">{{ config.title }}</a>
      <h4 v-if="config.subtitle" class="site-subtitle block" text="xs">
        {{ config.subtitle }}
      </h4>
      <div v-if="config.description" class="site-description my-1">
        {{ config.description }}
      </div>
    </div>

    <YunSidebarNav />
    <hr m="t-4 b-2">
    <YunSocialLinks />
    <hr m="y-2">
    <YunSidebarLinks />
    <br>
  </div>
</template>

<script lang="ts" setup>
import { useConfig } from 'valaxy'

const config = useConfig()
</script>

<style lang="scss">
@use "~/styles/mixins" as *;

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
      box-shadow: 0 0 30px rgba(var(--yun-c-primary-rgb), 0.2);
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
  background-color: var(--yun-c-bg-light);

  border: 1px solid rgba(255, 255, 255, 0.1);
}

.site-name {
  color: var(--yun-c-text);
  font-family: get-css-var('font-serif');
  font-weight: get-css-var('font-serif-weight');
}

.site-subtitle {
  color: get-css-var('c-gray');
  display: block;
}

.site-description {
  color: var(--yun-c-text);
  font-size: 0.8rem;
}
</style>
