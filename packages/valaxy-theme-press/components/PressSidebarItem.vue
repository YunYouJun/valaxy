<script setup lang="ts">
import type { PressTheme } from '../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { isActive, useSidebarControl } from '../composables/sidebar'

const props = defineProps<{
  item: PressTheme.SidebarItem
  depth: number
}>()

const {
  collapsed,
  collapsible,
  isLink,
  isActiveLink,
  hasActiveLink,
  hasChildren,
  toggle,
} = useSidebarControl(computed(() => props.item))

const linkTag = computed(() => (isLink.value ? 'a' : 'div'))

const textTag = computed(() => {
  return !hasChildren.value
    ? 'p'
    : props.depth + 2 === 7
      ? 'p'
      : `h${props.depth + 2}`
})

const rawText = computed(() => props.item.text || '')

const childItems = computed(() => props.item.items || [])

const hasChildItems = computed(() => childItems.value.length > 0)

const hasCaret = computed(() => collapsible.value && hasChildItems.value)

const classes = computed(() => [
  [`level-${props.depth}`],
  { collapsible: collapsible.value },
  { collapsed: collapsed.value },
  { 'is-link': isLink.value },
  { 'has-children': hasChildren.value },
  { 'is-active': isActiveLink.value },
  { 'has-active': hasActiveLink.value },
])

const itemRole = computed(() => (hasCaret.value && !isLink.value ? 'button' : undefined))

function onItemInteraction(e: MouseEvent | Event) {
  if ('key' in e && e.key !== 'Enter')
    return

  !props.item.link && toggle()
}

const { t } = useI18n()
const route = useRoute()

const htmlText = computed(() => {
  return t(rawText.value) || rawText.value
})

function getChildItemKey(item: PressTheme.SidebarItem, index: number): string | number {
  return item.text || item.link || index
}
</script>

<template>
  <li
    class="press-sidebar-item-node" :class="classes"
  >
    <div
      v-if="rawText"
      class="press-sidebar-item item"
      :role="itemRole"
      :tabindex="hasCaret && !props.item.link ? 0 : undefined"
      v-on="
        hasCaret && !props.item.link
          ? { click: onItemInteraction, keydown: onItemInteraction }
          : {}
      "
    >
      <AppLink
        v-if="props.item.link"
        :tag="linkTag"
        class="link press-sidebar-link"
        :class="{ 'is-active': isActiveLink }"
        :aria-current="isActiveLink ? 'page' : undefined"
        :href="props.item.link"
        :rel="props.item.rel"
        :target="props.item.target"
      >
        <component :is="textTag" class="text">
          <span v-html="htmlText" />
        </component>
      </AppLink>
      <component :is="textTag" v-else class="text">
        <span v-html="htmlText" />
      </component>

      <button
        v-if="hasCaret"
        type="button"
        aria-label="toggle section"
        :aria-expanded="!collapsed"
        class="caret"
        @click.stop="toggle"
      >
        <span class="caret-icon" :class="{ open: !collapsed }" i-ri-arrow-right-s-line aria-hidden="true" />
      </button>
    </div>

    <ul v-if="hasChildItems && !collapsed" class="items press-sidebar-item-list">
      <template v-if="depth < 5">
        <template v-for="(i, index) in childItems" :key="getChildItemKey(i, index)">
          <!-- Leaves have no collapse state. Render them directly instead of
               constructing a recursive component and its watchers per symbol. -->
          <li
            v-if="!i.items?.length && i.collapsed == null"
            class="VPSidebarItem press-sidebar-item-node"
            :class="[`level-${depth + 1}`, { 'is-link': !!i.link, 'is-active': isActive(route.path, i.link), 'has-active': isActive(route.path, i.link) }]"
          >
            <div v-if="i.text" class="press-sidebar-item item">
              <AppLink
                v-if="i.link"
                class="link press-sidebar-link"
                :class="{ 'is-active': isActive(route.path, i.link) }"
                :aria-current="isActive(route.path, i.link) ? 'page' : undefined"
                :href="i.link"
                :rel="i.rel"
                :target="i.target"
              >
                <p class="text">
                  <span v-html="t(i.text) || i.text" />
                </p>
              </AppLink>
              <p v-else class="text">
                <span v-html="t(i.text) || i.text" />
              </p>
            </div>
          </li>
          <PressSidebarItem v-else :item="i" :depth="depth + 1" />
        </template>
      </template>
    </ul>
  </li>
</template>

<style scoped>
.press-sidebar-item-node,
.press-sidebar-item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.item {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.press-sidebar-item-node.collapsible > .item {
  cursor: pointer;
}

.text {
  margin: 0;
  min-width: 0;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 24px;
}

.item > .text {
  flex-grow: 1;
  padding: 4px 8px;
  color: var(--pr-c-text-1);
}

.press-sidebar-item-node.has-children > .item .text {
  font-weight: 600;
}

.press-sidebar-item-node.has-children > .items {
  margin-top: 4px;
}

.press-sidebar-item-node:not(.level-0) > .items {
  margin-left: 8px;
  padding-left: 12px;
  border-left: 1px solid var(--pr-c-divider-light);
}
</style>
