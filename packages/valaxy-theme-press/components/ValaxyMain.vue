<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { useConfig, useFrontmatter, useLayout, useSidebar } from 'valaxy'

defineProps<{
  frontmatter: Post
  data?: PageData
}>()
const config = useConfig()
const frontmatter = useFrontmatter()

const { hasSidebar } = useSidebar()
const isHome = useLayout('home')
</script>

<template>
  <main
    class="press-main flex" :class="{
      'has-sidebar': hasSidebar,
    }"
  >
    <div w="full" flex="~" p="t-8 x-6 md:x-8">
      <slot name="main">
        <div class="content" m="auto y-0" flex="~ col grow" w="full" p="x-12 lt-md:0">
          <slot name="main-header" />
          <slot name="main-header-after" />

          <slot name="main-content">
            <div class="markdown-body prose max-w-none pb-8">
              <ValaxyMd :frontmatter="frontmatter">
                <h1 v-if="!isHome && frontmatter.title" :id="frontmatter.title" tabindex="-1">
                  {{ frontmatter.title }}
                  <a class="header-anchor" :href="`#${frontmatter.title}`" aria-hidden="true">#</a>
                </h1>
                <slot name="main-content-md" />
                <slot />
              </ValaxyMd>
            </div>
            <slot name="main-content-after" />
          </slot>
        </div>

        <slot name="main-nav-before" />

        <slot name="main-nav" />

        <slot name="main-nav-after" />

        <slot v-if="config.comment.enable && frontmatter.comment !== false" name="comment" />

        <slot name="footer" />
      </slot>

      <slot name="aside">
        <PressAside v-if="!isHome" />
      </slot>
    </div>
  </main>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

@include media('md') {
  .press-main {
    &.has-sidebar {
      padding-top: var(--pr-nav-height);
      padding-left: var(--va-sidebar-width);
    }
  }
}

@include media('xl') {
  .content{
    // 8px scrollbar width
    max-width: calc(100vw - 2 * var(--va-sidebar-width) - 2.5rem);

    &.no-aside {
      max-width: calc(100vw - var(--va-sidebar-width));
    }
  }
}
</style>
