<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { useFrontmatter, useLayout, useSidebar, useSiteConfig } from 'valaxy'

defineProps<{
  frontmatter: Post
  data?: PageData
}>()

const siteConfig = useSiteConfig()
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
    <div
      w="full" flex="~" :class="{
        'px-6 md:pl-12': hasSidebar,
      }" p="t-4"
    >
      <slot name="main">
        <div class="content" w="full" :class="{ 'm-auto': !hasSidebar }" flex="~ col grow" p="lt-md:0">
          <slot name="main-header" />
          <slot name="main-header-after" />

          <slot name="main-content">
            <ValaxyMd class="prose mx-auto w-full max-w-4xl" :frontmatter="frontmatter">
              <h1 v-if="hasSidebar && !isHome && frontmatter.title" :id="frontmatter.title" tabindex="-1">
                {{ frontmatter.title }}
                <a class="header-anchor" :href="`#${frontmatter.title}`" aria-hidden="true">#</a>
              </h1>
              <slot name="main-content-md" />
              <slot />
            </ValaxyMd>

            <PressDocFooter v-if="!isHome" class="pb-8 max-w-4xl" w="full" m="auto" />

            <slot name="main-content-after" />
          </slot>
        </div>

        <slot name="main-nav-before" />

        <slot name="main-nav" />

        <slot name="main-nav-after" />

        <slot v-if="siteConfig.comment.enable && frontmatter.comment !== false" name="comment" />

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

@include screen('md') {
  .press-main {
    &.has-sidebar {
      padding-top: var(--pr-nav-height);
      padding-left: var(--va-sidebar-width);
    }
  }
}

@include screen('xl') {
  .content{
    // 8px scrollbar width
    max-width: calc(100vw - 2 * var(--va-sidebar-width) - 2.5rem);

    &.no-aside {
      max-width: calc(100vw - var(--va-sidebar-width));
    }
  }
}
</style>
