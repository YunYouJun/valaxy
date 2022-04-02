<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import type { Post } from '../../types'
const { t } = useI18n()

defineProps<{ frontmatter: Post }>()
</script>

<template>
  <aside class="right-sidebar val-card relative" m="l-4" text="center">
    <h2 v-if="frontmatter.toc !== false" m="t-6 b-2" font="serif black">
      {{ t('sidebar.toc') }}
    </h2>

    <div class="right-sidebar-container sticky">
      <ValaxyToc v-if="frontmatter.toc !== false" />

      <div v-if="$slots.custom" class="custom-container">
        <slot name="custom" />
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
.right-sidebar {
  width: var(--yun-sidebar-width-mobile);
}
.right-sidebar-container {
  top: 1rem;
}
</style>
