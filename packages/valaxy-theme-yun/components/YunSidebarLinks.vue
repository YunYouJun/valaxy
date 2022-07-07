<script lang="ts" setup>
import { useThemeConfig } from '../composables'
const themeConfig = useThemeConfig()
</script>

<template>
  <div class="links">
    <a v-for="item, i in themeConfig.pages" :key="i" class="link-item yun-icon-btn" :href="item.url" :title="item.name" :target="item.url.startsWith('http') ? '_blank' : ''" :style="`color:${item.color}`">
      <div :class="item.icon" class="icon" />
    </a>
  </div>
</template>

<style lang="scss">
.sidebar {
  .links {
    display: flex;
    justify-content: center;
  }

  .link-item {
    display: inline-flex;

    .icon {
      width: 2rem;
      height: 2rem;
    }
  }
}
</style>
