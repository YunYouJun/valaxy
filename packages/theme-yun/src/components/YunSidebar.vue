<template>
  <div class="sidebar-panel">
    <div class="site-info">
      <a class="site-author-avatar">
        <img>
        <span class="site-author-status">🌛</span>
      </a>
      <div class="site-author-name">
        <a href="/about">
          {{ config.author }}
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useConfig } from 'valaxy'

const config = useConfig()
</script>

<style lang="scss">
@use "~/styles/mixins" as *;

#site-overview-wrap {
  padding-top: 2rem;
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

// if (hexo-config('avatar.rounded')) {
  .site-author-avatar {
    img {
      border-radius: 50%;
    }
  }
// }

.site-author-name {
  margin-top: 0;
  margin-bottom: 1rem;
  line-height: 1.5;
}

// if (hexo-config('avatar.status.enable')) {
  .site-author-status {
    position: absolute;
    height: 1.8rem;
    width: 1.8rem;
    bottom: 0;
    right: 0;
    line-height: 1.8rem;
    border-radius: 50%;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    background-color: white;
  }
// }

.site-name {
  color: var(--yun-c-text);
  font-family: get-css-var('font-family-serif');
  font-weight: get-css-var('font-family-serif-weight');
}

.site-subtitle {
  color: get-css-var('c-gray');
  display: block;
}

.site-description {
  color: var(--yun-c-text);
  font-size: 0.8rem;
}

.site-state {
  display: flex;
  justify-content: center;
  overflow: hidden;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
  margin-top: 1rem;
}

.site-state-item {
  display: flex;
  padding: 0 15px;
  align-items: center;
  border-left: 1px solid get-css-var('c-gray');

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

.site-state-item-icon {
  color: var(--yun-c-text);
  line-height: 1;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.site-state-item-count {
  color: var(--yun-c-text);
  display: block;
  text-align: center;
  font-size: 1rem;
}
</style>
