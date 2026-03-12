<script setup lang="ts">
import type { MenuItem } from 'valaxy'
import { useI18n } from 'vue-i18n'

defineProps<{
  headers: MenuItem[]
  onClick: (e: MouseEvent) => void
  root?: boolean
}>()

const { locale } = useI18n()
</script>

<template>
  <ul :class="root ? 'root' : 'nested'">
    <li v-for="{ children, link, title, lang } in headers" :key="link" class="va-toc-item" :lang="lang || locale">
      <a class="outline-link" :href="link" @click="onClick">{{ title }}</a>
      <template v-if="children?.length">
        <YunOutlineItem :headers="children" :on-click="onClick" />
      </template>
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.va-toc {
  .va-toc-item {
    .outline-link {
      color: var(--va-c-text-light);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color var(--va-transition-duration-moderate);

      &:hover,
      &.active {
        color: var(--va-c-primary-lighter);
        transition: color var(--va-transition-duration);
      }

    }

    .nested {
      padding-left: 0.8rem;
    }
  }
}
</style>
