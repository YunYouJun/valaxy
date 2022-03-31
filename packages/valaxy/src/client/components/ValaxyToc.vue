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
  <ul class="val-toc" p="l-4">
    <li v-for="header, i in headers" :key="i" :style="getStylesByLevel(header.level)">
      <a class="toc-link-item" :href="`#${header.slug}`">{{ header.title }}</a>
    </li>
  </ul>
</template>

<style lang="scss">
.val-toc {
  top: 10px;
  width: var(--yun-sidebar-width-mobile);

  background-color: var(--yun-c-bg-light);

  font-size: 1rem;
  font-family: var(--yun-font-serif);
  font-weight: 900;
  line-height: 1.6;

  text-align: left;

  a {
    display: block;
    color: var(--c-toc-link);
    transition: color var(--yun-transition-duration);

    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &:hover {
      color: var(--yun-c-text);
    }
  }

  .toc-link-item {
    color: var(--yun-c-text-light);

    &:hover {
      color: var(--yun-c-text);
    }

    &.active {
      color: var(--yun-c-primary);
    }
  }
}
</style>
