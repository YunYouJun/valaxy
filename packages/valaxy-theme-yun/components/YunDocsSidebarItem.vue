<script setup lang="ts">
import type { YunTheme } from '../types'
import { computed, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  containsYunDocsSidebarActiveLink,
  isYunDocsSidebarLinkActive,
} from '../utils/sidebar'

const props = withDefaults(defineProps<{
  item: YunTheme.SidebarItem
  depth?: number
}>(), {
  depth: 0,
})

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const { t } = useI18n()

const childItems = computed(() => props.item.items || [])
const hasChildren = computed(() => childItems.value.length > 0)
const isCollapsible = computed(() => props.item.collapsed !== undefined)
const isActive = computed(() => isYunDocsSidebarLinkActive(route.path, props.item.link))
const hasActiveChild = computed(() => childItems.value.some(item => containsYunDocsSidebarActiveLink(route.path, item)))
const label = computed(() => t(props.item.text) || props.item.text)

const collapsed = shallowRef(props.item.collapsed === true)

watch(
  () => props.item.collapsed,
  value => collapsed.value = value === true,
)

watch(
  [isActive, hasActiveChild],
  ([active, activeChild]) => {
    if (active || activeChild)
      collapsed.value = false
  },
  { immediate: true },
)

function toggle() {
  if (isCollapsible.value)
    collapsed.value = !collapsed.value
}

function getItemKey(item: YunTheme.SidebarItem, index: number) {
  return item.link || item.text || index
}
</script>

<template>
  <li
    class="yun-docs-sidebar-item"
    :class="{
      'is-active': isActive,
      'has-active-child': hasActiveChild,
    }"
  >
    <div class="yun-docs-sidebar-item-row">
      <AppLink
        v-if="item.link"
        class="yun-docs-sidebar-item-link"
        :to="item.link"
        :rel="item.rel"
        :target="item.target"
        :aria-current="isActive ? 'page' : undefined"
        @click="emit('navigate')"
      >
        {{ label }}
      </AppLink>
      <span v-else class="yun-docs-sidebar-item-label">
        {{ label }}
      </span>

      <button
        v-if="hasChildren && isCollapsible"
        type="button"
        class="yun-docs-sidebar-item-toggle"
        :aria-label="t('theme.toggleSection', { title: label })"
        :aria-expanded="!collapsed"
        @click="toggle"
      >
        <span
          i-ri-arrow-right-s-line
          aria-hidden="true"
          :class="{ 'is-open': !collapsed }"
        />
      </button>
    </div>

    <ul v-if="hasChildren && !collapsed" class="yun-docs-sidebar-item-children">
      <YunDocsSidebarItem
        v-for="(child, index) in childItems"
        :key="getItemKey(child, index)"
        :item="child"
        :depth="depth + 1"
        @navigate="emit('navigate')"
      />
    </ul>
  </li>
</template>

<style scoped>
.yun-docs-sidebar-item,
.yun-docs-sidebar-item-children {
  padding: 0;
  margin: 0;
  list-style: none;
}

.yun-docs-sidebar-item-children {
  padding-left: 0.75rem;
  margin-left: 0.45rem;
  border-left: 1px solid var(--va-c-divider);
}

.yun-docs-sidebar-item-row {
  display: flex;
  gap: 0.25rem;
  align-items: center;
  min-height: 2.25rem;
}

.yun-docs-sidebar-item-link,
.yun-docs-sidebar-item-label {
  flex: 1;
  padding: 0.45rem 0.65rem;
  overflow: hidden;
  color: var(--va-c-text-2);
  text-overflow: ellipsis;
  white-space: nowrap;
  border-radius: 0.5rem;
  transition: color var(--va-transition-duration-fast), background-color var(--va-transition-duration-fast);
}

.yun-docs-sidebar-item-label {
  color: var(--va-c-text);
  font-weight: 700;
}

.yun-docs-sidebar-item-link:hover,
.yun-docs-sidebar-item.is-active > .yun-docs-sidebar-item-row > .yun-docs-sidebar-item-link {
  color: var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 10%, transparent);
}

.yun-docs-sidebar-item.has-active-child > .yun-docs-sidebar-item-row > .yun-docs-sidebar-item-label {
  color: var(--va-c-primary);
}

:global(html.dark .yun-docs-sidebar-item.is-active > .yun-docs-sidebar-item-row > .yun-docs-sidebar-item-link),
:global(html.dark .yun-docs-sidebar-item.has-active-child > .yun-docs-sidebar-item-row > .yun-docs-sidebar-item-label) {
  color: var(--va-c-primary-lighter);
}

.yun-docs-sidebar-item-toggle {
  display: inline-flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: var(--va-c-text-2);
  border-radius: 50%;
}

.yun-docs-sidebar-item-toggle:hover {
  color: var(--va-c-primary);
  background: color-mix(in srgb, var(--va-c-primary) 10%, transparent);
}

.yun-docs-sidebar-item-toggle span {
  transition: transform var(--va-transition-duration-fast);
}

.yun-docs-sidebar-item-toggle span.is-open {
  transform: rotate(90deg);
}
</style>
