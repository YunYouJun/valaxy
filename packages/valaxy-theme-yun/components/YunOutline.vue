<script setup lang="ts">
import {
  useActiveAnchor,
  useFrontmatter,
  useOutline,
} from 'valaxy'
import { computed, nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../composables'
import {
  collectCollapsibleOutlineLinks,
  computeAutoCollapsedLinks,
  findOutlineAncestorLinks,
  normalizeOutlineHash,
} from '../utils'

const emit = defineEmits<{
  select: []
}>()
const { t } = useI18n()
const frontmatter = useFrontmatter()
const themeConfig = useThemeConfig()
const containerRef = shallowRef()
const marker = shallowRef()

const { headers, handleClick } = useOutline()
const { activeLink, refreshMarker } = useActiveAnchor(containerRef, marker)

const collapseMode = computed(() => frontmatter.value.outlineCollapsible ?? themeConfig.value.outlineCollapsible ?? true)
const collapsibleLinks = computed(() => collectCollapsibleOutlineLinks(headers.value))
const collapsibleEnabled = computed(() => collapseMode.value !== false && collapsibleLinks.value.length > 0)

const collapsedLinks = shallowRef<Set<string>>(new Set())
let markerTimer: ReturnType<typeof setTimeout> | undefined

onBeforeUnmount(() => {
  clearTimeout(markerTimer)
})

const normalizedCollapsedLinks = computed(
  () => new Set([...collapsedLinks.value].map(normalizeOutlineHash)),
)

const activeAncestorLinks = computed(() => {
  const ancestors = findOutlineAncestorLinks(headers.value, activeLink.value)
  return new Set([...ancestors].map(normalizeOutlineHash))
})

const allCollapsed = computed(
  () => collapsibleLinks.value.length > 0
    && collapsibleLinks.value.every(link => normalizedCollapsedLinks.value.has(normalizeOutlineHash(link))),
)

function scheduleMarkerRefresh() {
  void nextTick(() => {
    refreshMarker()
  })
  clearTimeout(markerTimer)
  markerTimer = setTimeout(() => {
    refreshMarker()
  }, 220)
}

watch(
  [headers, collapseMode],
  ([nextHeaders, mode]) => {
    collapsedLinks.value = mode === 'auto'
      ? computeAutoCollapsedLinks(nextHeaders, activeLink.value)
      : new Set()
    scheduleMarkerRefresh()
  },
  { immediate: true },
)

watch(
  activeLink,
  (nextActive) => {
    if (collapseMode.value === 'auto') {
      collapsedLinks.value = computeAutoCollapsedLinks(headers.value, nextActive)
      scheduleMarkerRefresh()
    }
  },
)

function toggleSection(link: string) {
  const normalizedTarget = normalizeOutlineHash(link)
  const next = new Set(collapsedLinks.value)
  const existing = [...next].find(item => normalizeOutlineHash(item) === normalizedTarget)
  if (existing !== undefined)
    next.delete(existing)
  else
    next.add(link)
  collapsedLinks.value = next
  scheduleMarkerRefresh()
}

function toggleAll() {
  if (!collapsibleLinks.value.length)
    return
  collapsedLinks.value = allCollapsed.value ? new Set() : new Set(collapsibleLinks.value)
  scheduleMarkerRefresh()
}

function onBranchTransitionEnd(event: TransitionEvent) {
  if (event.target === event.currentTarget && event.propertyName === 'grid-template-rows')
    refreshMarker()
}

function onItemClick(event: MouseEvent) {
  handleClick(event)
  emit('select')
}
</script>

<template>
  <div v-show="headers.length" ref="containerRef">
    <div class="content">
      <div class="outline-header">
        <div class="outline-title">
          {{ t('theme.outlineTitle') }}
        </div>

        <button
          v-if="collapsibleEnabled"
          type="button"
          class="outline-toggle-all"
          :aria-label="allCollapsed ? t('theme.expandAllOutline') : t('theme.collapseAllOutline')"
          :title="allCollapsed ? t('theme.expandAllOutline') : t('theme.collapseAllOutline')"
          :aria-pressed="allCollapsed"
          @click="toggleAll"
        >
          <span v-if="allCollapsed" i-ri-expand-vertical-line aria-hidden="true" />
          <span v-else i-ri-collapse-vertical-line aria-hidden="true" />
        </button>
      </div>

      <div ref="marker" class="outline-marker" />

      <nav :aria-label="t('sidebar.toc')">
        <YunOutlineItem
          class="va-toc relative z-1 css-i18n-toc"
          :headers="headers"
          :on-click="onItemClick"
          :collapsible="collapsibleEnabled"
          :collapsed-links="normalizedCollapsedLinks"
          :active-ancestors="activeAncestorLinks"
          :on-toggle="toggleSection"
          :on-transition-end="onBranchTransitionEnd"
          root
        />
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-toc {
  text-align: left;
}

.content {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  text-align: left;
}

.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-height: 28px;
}

.outline-marker {
  position: absolute;
  top: 32px;
  left: -2px;
  z-index: 0;
  opacity: 0;
  width: 4px;
  height: 18px;
  background-color: var(--va-c-brand);
  transition: top var(--va-transition-duration) cubic-bezier(0, 1, 0.5, 1), background-color var(--va-transition-duration-moderate), opacity var(--va-transition-duration);
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

.outline-title {
  letter-spacing: 0.4px;
  line-height: 28px;
  font-size: 14px;
  font-weight: 600;
}

.outline-toggle-all {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 24px;
  height: 24px;
  margin-left: auto;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--va-c-text-3, var(--va-c-text-light));
  font-size: 14px;
  cursor: pointer;
  transition:
    color var(--va-transition-duration-fast, 160ms) ease,
    background-color var(--va-transition-duration-fast, 160ms) ease;

  &:hover {
    color: var(--va-c-primary);
    background-color: var(--yun-action-btn-hover-bg, rgb(0 120 231 / 0.08));
  }

  &:focus-visible {
    outline: 2px solid var(--yun-focus-color, var(--va-c-primary));
    outline-offset: 1px;
  }
}

.outline-link {
  display: block;
  line-height: 28px;
  color: var(--va-c-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--va-transition-duration-moderate);
}

.outline-link:hover,
.outline-link.active {
  color: var(--va-c-brand);
  transition: color var(--va-transition-duration);
}

@media (prefers-reduced-motion: reduce) {
  .outline-marker,
  .outline-toggle-all {
    transition: none;
  }
}
</style>
