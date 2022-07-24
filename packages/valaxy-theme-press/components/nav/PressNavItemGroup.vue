<script lang="ts" setup>
import { ref } from 'vue'
import type { NavItemGroup } from '../../types'
defineProps<{
  item: NavItemGroup
}>()

const open = ref(false)
</script>

<template>
  <div
    ref="el"
    class="self-stretch relative group"
    :aria-expanded="open"
    aria-haspopup="true"
    @mouseenter="open = true"
    @mouseleave="open = false"
  >
    <button
      type="button"
      class="button flex items-center"
      @click="open = !open"
    >
      <span class="text">
        {{ item.text }}
      </span>
      <div i-ri-arrow-drop-down-line />
    </button>

    <div class="menu flex items-center flex-col grow">
      <a v-for="itemLink in item.items" :key="itemLink.text" class="menu-item" :href="itemLink.link">
        {{ itemLink.text }}
        <div class="icon-link inline-block" i-ri-arrow-right-up-line />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.group{
  top: calc(var(--pr-nav-height) / 2 - 10px);
}
.group .button{
  color: var(--pr-nav-text);
  font-weight: 500;
  font-size: 14px;
}

.group[aria-expanded="true"] .button{
  color: rgba(60, 60, 60, 0.70);
  transition: color 0.25s;

  .dark &{
    color: rgba(235, 235, 235, 0.6)
  }
}

.menu {
  position: absolute;
  top: 30px;
  right: 0;

  min-width: 128px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.25s, visibility 0.25s, transform 0.25s;

  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(60, 60, 60, 0.12);
  background-color: #ffffff;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.08);
  .dark &{
    background-color: #242424;
  }

  &-item{
    display: block;
    text-align: center;
    width: 100%;
    padding: 0 6px;
    border-radius: 6px;
    color: var(--pr-nav-text);
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition: background-color .25s,color .25s;

    &:hover{
      background-color: #f1f1f1;
      color: var(--va-c-brand);

      .dark &{
        background-color: #2f2f2f;
      }
    }

  }
}

.group[aria-expanded="true"] > .menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.icon-link{
  display: inline-block;
  margin-top: -1px;
  margin-left: 4px;
  width: 11px;
  height: 11px;
  color: rgba(60, 60, 60, 0.33);
  transition: color .25s;

  .dark &{
    color: rgba(235, 235,235, 0.38)
  }
}
</style>
