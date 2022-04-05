<script lang="ts" setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useActiveSidebarLinks } from '~/composables'

const route = useRoute()
const headers = computed(() => route.meta.headers)

useActiveSidebarLinks()

function getStylesByLevel(level: number) {
  return {
    fontSize: `${(6 - level) * 0.2 + 0.4}rem`,
    paddingLeft: `${level * 1 - 1}rem`,
  }
}

// todo mobile toc widget
</script>

<template>
  <ul class="va-toc" p="l-4">
    <li v-for="header, i in headers" :key="i" :style="getStylesByLevel(header.level)">
      <a class="toc-link-item" :href="`#${header.slug}`">{{ header.title }}</a>
    </li>
  </ul>
</template>

<style lang="scss">
.va-toc {
  top: 10px;
  width: var(--yun-sidebar-width-mobile);

  background-color: var(--va-c-bg-light);

  font-size: 1rem;
  font-family: var(--va-font-serif);
  font-weight: 900;
  line-height: 1.6;

  text-align: left;

  a {
    display: block;
    color: var(--c-toc-link);
    transition: color var(--va-transition-duration);

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    font-weight: 900;

    &:hover {
      color: var(--va-c-text);
    }
  }

  .toc-link-item {
    color: var(--va-c-text-light);

    &:hover {
      color: var(--va-c-text);
    }

    &.active {
      color: var(--va-c-primary);
    }
  }
}
</style>
