<script lang="ts" setup>
import { useCategories, useSiteStore, useTags } from 'valaxy'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const site = useSiteStore()

const categories = useCategories()
const tags = useTags()

const navRef = ref<HTMLElement>()
const pill = reactive({
  visible: false,
  ready: false,
  active: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
})

const pillStyle = computed(() => ({
  width: `${pill.width}px`,
  height: `${pill.height}px`,
  transform: `translate3d(${pill.x}px, ${pill.y}px, 0)`,
}))

function movePill(event: Event) {
  if (event instanceof PointerEvent && event.pointerType !== 'mouse' && event.pointerType !== 'pen')
    return
  const target = (event.target as Element | null)?.closest('.post-classify-nav-item')
  if (!(target instanceof HTMLElement) || !navRef.value?.contains(target))
    return

  const wasVisible = pill.visible
  pill.x = target.offsetLeft
  pill.y = target.offsetTop
  pill.width = target.offsetWidth
  pill.height = target.offsetHeight
  pill.active = target.classList.contains('router-link-active')
  pill.visible = true

  if (!wasVisible) {
    pill.ready = false
    requestAnimationFrame(() => {
      if (pill.visible)
        pill.ready = true
    })
  }
}

function hidePill(event: Event) {
  if (event instanceof FocusEvent && event.relatedTarget instanceof Node && navRef.value?.contains(event.relatedTarget))
    return
  pill.visible = false
  pill.ready = false
  pill.active = false
}
</script>

<template>
  <nav
    ref="navRef"
    class="site-nav has-hover-pill"
    text-xl
    @pointerover="movePill"
    @focusin="movePill"
    @pointerleave="hidePill"
    @focusout="hidePill"
  >
    <span
      class="site-nav-hover-pill"
      :class="{ 'is-visible': pill.visible, 'is-ready': pill.ready, 'is-active': pill.active }"
      :style="pillStyle"
      aria-hidden="true"
    />
    <YunPostClassifyNavItem
      to="/archives/"
      icon="i-ri-archive-line"
      active-icon="i-ri-archive-fill"
      :title="t('menu.archives')"
      :total="site.postList.length"
    />
    <YunPostClassifyNavItem
      to="/categories/"
      icon="i-ri-folder-2-line"
      active-icon="i-ri-folder-2-fill"
      :title="t('menu.categories')"
      :total="Array.from(categories.children).length"
    />
    <YunPostClassifyNavItem
      to="/tags/"
      icon="i-ri-price-tag-3-line"
      active-icon="i-ri-price-tag-3-fill"
      :title="t('menu.tags')"
      :total="Array.from(tags).length"
    />
  </nav>
</template>

<style lang="scss">
@use "valaxy/client/styles/mixins/index.scss" as *;

.site-nav {
  position: relative;
  display: flex;
  justify-content: center;
  margin-block: -0.25rem;
  overflow: hidden;
  line-height: 1.5;
  white-space: nowrap;
  text-align: center;
}

.site-nav-hover-pill {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
  border-radius: var(--yun-action-btn-radius, 0.625rem);
  background-color: var(--yun-action-btn-hover-bg);
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--va-transition-duration-fast, 180ms) ease;

  &.is-visible {
    opacity: 1;
  }

  &.is-active {
    background-color: color-mix(in srgb, var(--va-c-link) 12%, transparent);
  }

  &.is-ready {
    transition:
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
      width 220ms cubic-bezier(0.22, 1, 0.36, 1),
      height 220ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color var(--va-transition-duration-fast, 180ms) ease,
      opacity var(--va-transition-duration-fast, 180ms) ease;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-nav-hover-pill,
  .site-nav-hover-pill.is-ready {
    transition: none;
  }
}
</style>
