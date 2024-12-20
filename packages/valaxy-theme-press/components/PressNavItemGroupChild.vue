<script lang="ts" setup>
import type { NavItemGroup } from '../types'
import { useI18n } from 'vue-i18n'

defineProps<{
  text?: string
  items: NavItemGroup[]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="menu-group-item">
    <p v-if="text" class="title">
      {{ text }}
    </p>
    <template v-for="item in items" :key="item.link">
      <AppLink :to="item.link" class="menu-item" p="x-3">
        {{ item.text?.includes(".") ? t(item.text) : item.text }}
      </AppLink>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.menu-group-item {
  display: block;
  margin: 12px -12px 0;
  border-top: 1px solid rgb(60 60 60 / 0.12);
  padding: 12px 12px 0;

  .title {
    padding: 0 12px;
    line-height: 28px;
    font-size: 14px;
    font-weight: 600;
    color: rgb(60 60 60 / 0.33);
    white-space: nowrap;
    transition: color 0.25s;
  }

  &:first-child {
    margin-top: 0;
    border-top: 0;
    padding-top: 0;
  }

  .menu-item {
    display: flex;
    width: 100%;
    border-radius: 6px;
    color: var(--pr-nav-text);
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition:
      background-color 0.25s,
      color 0.25s;

    &:hover {
      background-color: #f1f1f1;
      color: var(--va-c-brand);

      .dark & {
        background-color: #2f2f2f;
      }
    }
  }
}
</style>
