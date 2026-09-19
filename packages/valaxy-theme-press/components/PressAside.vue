<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { useI18n } from 'vue-i18n'

const frontmatter = useFrontmatter()
const { t } = useI18n()
</script>

<template>
  <aside id="press-page-outline" class="press-aside" :aria-label="t('theme.outlineTitle')">
    <div class="aside-container">
      <PressOutline v-if="frontmatter.toc !== false" />
      <div v-if="$slots.default" class="custom-container">
        <slot />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.press-aside {
  display: none;
  flex-shrink: 0;
  width: var(--va-aside-width);
  padding-left: 32px;
}

.aside-container {
  position: sticky;
  top: calc(var(--pr-nav-height) + 24px);
  max-height: calc(100dvh - var(--pr-nav-height) - 48px);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.custom-container {
  margin-top: 24px;
}

@media (width >= 1280px) {
  .press-aside { display: block; }
}
</style>
