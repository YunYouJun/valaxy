<template>
  <div class="links-of-author">
    <a v-for="item, i in config.social" :key="i" class="links-of-author-item yun-icon-btn" rel="noopener" :href="item.link" :title="item.name" target="_blank" :style="`color:${item.color}`">
      <div class="icon" :class="item.icon" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import { useConfig } from 'valaxy'

const config = useConfig()
</script>

<style lang="scss">
.links-of-author {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  &-item {
    line-height: 1;
    font-size: 0.9rem;
  }
}
</style>
