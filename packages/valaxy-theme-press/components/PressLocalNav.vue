<script lang="ts" setup>
import { useFrontmatter, useLayout, useOutline, useSidebar } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  open: boolean
}>()

defineEmits<{
  (e: 'openMenu'): void
}>()

const { hasSidebar } = useSidebar()
const { headers } = useOutline()
const frontmatter = useFrontmatter()
const layout = useLayout()
const { t } = useI18n()
const hasDocumentMenu = computed(() => hasSidebar.value && layout.value !== 'post')
const hasOutline = computed(() => layout.value !== 'home' && frontmatter.value.toc !== false && headers.value.length > 0)
</script>

<template>
  <div v-if="hasDocumentMenu || hasOutline" class="press-local-nav" :class="{ 'has-sidebar': hasDocumentMenu }">
    <button
      v-if="hasDocumentMenu"
      type="button"
      class="menu"
      :aria-expanded="open"
      aria-controls="pr-sidebar-nav"
      @click="$emit('openMenu')"
    >
      <span i-ri-align-left class="menu-icon" aria-hidden="true" />
      <span>{{ t('menu.title') }}</span>
    </button>
    <PressLocalNavOutlineDropdown v-if="hasOutline" :headers="headers" />
  </div>
</template>

<style scoped>
.press-local-nav {
  position: sticky;
  top: var(--pr-nav-height);
  z-index: var(--pr-z-local-nav);
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  border-bottom: 1px solid var(--pr-c-divider-light);
  background-color: var(--pr-c-bg);
}

.menu {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  min-height: 48px;
  font-size: 13px;
  font-weight: 500;
  color: var(--pr-c-text-2);
}

.menu:hover,
.menu[aria-expanded='true'] {
  color: var(--pr-c-brand);
}

.menu-icon {
  width: 18px;
  height: 18px;
}

@media (width >= 960px) {
  .press-local-nav.has-sidebar {
    margin-left: var(--va-sidebar-width);
  }

  .menu { display: none; }
}

@media (width >= 1280px) {
  .press-local-nav { display: none; }
}
</style>
