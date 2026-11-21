<script setup lang="ts">
import { useFrontmatter, useOutline } from 'valaxy'
import { computed, useTemplateRef } from 'vue'
import { useYunAppStore } from '../../stores'

// common layout

const props = withDefaults(defineProps<{
  footer?: boolean
  noMargin?: boolean
  outlineNav?: boolean
  authorNotes?: boolean
  localMenu?: boolean
  localMenuOpen?: boolean
  localMenuControls?: string
  localMenuLabel?: string
  localMenuKind?: 'docs' | 'collection'
}>(), {
  footer: true,
  noMargin: false,
  outlineNav: false,
  localMenu: false,
  localMenuOpen: false,
  localMenuControls: 'yun-docs-sidebar',
  localMenuKind: 'docs',
})

const emit = defineEmits<{
  toggleLocalMenu: []
}>()

const yun = useYunAppStore()
const frontmatter = useFrontmatter()
const layout = useTemplateRef('layout')
const { headers } = useOutline()
const hasLocalOutline = computed(() => props.outlineNav
  && frontmatter.value.aside !== false
  && frontmatter.value.toc !== false
  && frontmatter.value.outline !== false
  && headers.value.length > 0)
const classes = computed(() => {
  if (yun.isNimbo)
    return 'mt-12 md:mt-24'
  return 'mt-12'
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <YunLocalOutlineNav
      v-if="hasLocalOutline || localMenu"
      :outline-open="yun.rightSidebar.isOpen"
      :show-outline="hasLocalOutline"
      :show-menu="localMenu"
      :menu-open="localMenuOpen"
      :menu-controls="localMenuControls"
      :menu-label="localMenuLabel"
      :menu-kind="localMenuKind"
      @toggle-outline="yun.rightSidebar.toggle()"
      @toggle-menu="emit('toggleLocalMenu')"
    />
    <div
      ref="layout"
      class="yun-layout-wrapper-content yun-layout-wrapper__content"
      :class="[noMargin ? '' : classes, { 'has-local-outline': hasLocalOutline, 'has-local-menu': localMenu }]"
    >
      <slot />
      <YunAuthorNotes v-if="authorNotes && frontmatter.aside !== false" :layout="layout" />
    </div>
    <YunFooter v-if="footer" />
  </div>
</template>

<style>
.yun-layout-wrapper-content {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  margin: 0 auto;
}

/* Switch to horizontal three-column layout on large screens */
@media (width >= 1024px) {
  .yun-layout-wrapper-content {
    flex-direction: row;
    align-items: start;
  }
}

@media (width >= 1280px) {
  .yun-layout-wrapper-content:has(> .yun-author-notes) {
    width: min(86.25rem, calc(100% - 3rem));
    gap: 1.5rem;
  }

  .yun-layout-wrapper-content:has(> .yun-author-notes) > .yun-layout-left {
    flex: 0 0 clamp(12.5rem, 15vw, 16rem);
    min-width: 0;
  }

  .yun-layout-wrapper-content:has(> .yun-author-notes) > .yun-main {
    flex: 1;
    min-width: 0;
  }

  .yun-layout-wrapper-content:has(> .yun-author-notes) > .yun-main > .content {
    width: 100%;
    min-width: 0;
  }

  .yun-layout-wrapper-content:has(> .yun-author-notes) > .yun-aside {
    display: none;
  }
}

@media (width < 768px) {
  .yun-layout-wrapper-content.has-local-outline,
  .yun-layout-wrapper-content.has-local-menu {
    margin-top: 0;
  }
}

@media (width >= 768px) and (width < 1024px) {
  .yun-layout-wrapper-content.has-local-outline,
  .yun-layout-wrapper-content.has-local-menu {
    margin-top: 1rem;
  }
}

@media (width >= 1024px) and (width < 1280px) {
  .yun-layout-wrapper-content.has-local-outline {
    --yun-margin-top: calc(var(--yun-nav-height, 50px) + var(--yun-local-nav-height, 40px) + 1rem);

    margin-top: 1rem;
  }
}
</style>
