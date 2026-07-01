<script setup lang="ts">
import type { DefaultTheme } from 'vitepress/theme'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSidebarControl } from '../composables/sidebar'

const props = defineProps<{
  item: DefaultTheme.SidebarItem
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

const htmlText = computed(() => {
  return t(rawText.value) || rawText.value
})

function getChildItemKey(item: DefaultTheme.SidebarItem, index: number): string | number {
  return item.text || item.link || index
}
</script>

<template>
  <li
    class="VPSidebarItem press-sidebar-item-node" :class="classes"
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
      <div class="indicator" />

      <AppLink
        v-if="props.item.link"
        :tag="linkTag"
        class="link"
        :href="props.item.link"
        :rel="props.item.rel"
        :target="props.item.target"
      >
        <component :is="textTag" class="text ml-1">
          <span v-html="htmlText" />
        </component>
      </AppLink>
      <component :is="textTag" v-else class="text ml-1">
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

    <ul v-if="hasChildItems" class="items press-sidebar-item-list">
      <template v-if="depth < 5">
        <PressSidebarItem
          v-for="(i, index) in childItems"
          :key="getChildItemKey(i, index)"
          :item="i"
          :depth="depth + 1"
        />
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

.VPSidebarItem.level-0 {
  padding-bottom: 24px;
}

.VPSidebarItem.collapsed.level-0 {
  padding-bottom: 10px;
}

.item {
  position: relative;
  display: flex;
  width: 100%;
}

.VPSidebarItem.collapsible > .item {
  cursor: pointer;
}

.indicator {
  position: absolute;
  top: 6px;
  bottom: 6px;
  left: -17px;
  width: 2px;
  border-radius: 2px;
  transition: background-color var(--va-transition-duration);
}

.VPSidebarItem.level-2.is-active > .item > .indicator,
.VPSidebarItem.level-3.is-active > .item > .indicator,
.VPSidebarItem.level-4.is-active > .item > .indicator,
.VPSidebarItem.level-5.is-active > .item > .indicator {
  background-color: var(--vp-c-brand-1);
}

.link {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.text {
  flex-grow: 1;
  padding: 4px 0;
  line-height: 24px;
  font-size: 14px;
  transition: color var(--va-transition-duration);
}

.VPSidebarItem.level-0 .text {
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.VPSidebarItem.level-1 .text,
.VPSidebarItem.level-2 .text,
.VPSidebarItem.level-3 .text,
.VPSidebarItem.level-4 .text,
.VPSidebarItem.level-5 .text {
  font-weight: 500;
  color: var(--vp-c-text-2);
}

.VPSidebarItem.level-0.is-link > .item > .link:hover .text,
.VPSidebarItem.level-1.is-link > .item > .link:hover .text,
.VPSidebarItem.level-2.is-link > .item > .link:hover .text,
.VPSidebarItem.level-3.is-link > .item > .link:hover .text,
.VPSidebarItem.level-4.is-link > .item > .link:hover .text,
.VPSidebarItem.level-5.is-link > .item > .link:hover .text {
  color: var(--vp-c-brand-1);
}

.VPSidebarItem.level-0.has-active > .item > .text,
.VPSidebarItem.level-1.has-active > .item > .text,
.VPSidebarItem.level-2.has-active > .item > .text,
.VPSidebarItem.level-3.has-active > .item > .text,
.VPSidebarItem.level-4.has-active > .item > .text,
.VPSidebarItem.level-5.has-active > .item > .text,
.VPSidebarItem.level-0.has-active > .item > .link > .text,
.VPSidebarItem.level-1.has-active > .item > .link > .text,
.VPSidebarItem.level-2.has-active > .item > .link > .text,
.VPSidebarItem.level-3.has-active > .item > .link > .text,
.VPSidebarItem.level-4.has-active > .item > .link > .text,
.VPSidebarItem.level-5.has-active > .item > .link > .text {
  color: var(--vp-c-text-1);
}

.VPSidebarItem.level-0.is-active > .item .link > .text,
.VPSidebarItem.level-1.is-active > .item .link > .text,
.VPSidebarItem.level-2.is-active > .item .link > .text,
.VPSidebarItem.level-3.is-active > .item .link > .text,
.VPSidebarItem.level-4.is-active > .item .link > .text,
.VPSidebarItem.level-5.is-active > .item .link > .text {
  color: var(--vp-c-brand-1);
}

.VPSidebarItem.level-1 .items,
.VPSidebarItem.level-2 .items,
.VPSidebarItem.level-3 .items,
.VPSidebarItem.level-4 .items,
.VPSidebarItem.level-5 .items {
  border-left: 1px solid var(--vp-c-divider);
  padding-left: 16px;
}

.VPSidebarItem.collapsed .items {
  display: none;
}
</style>
