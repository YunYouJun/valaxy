<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { usePostTitle, useRuntimeConfig, useSiteConfig } from 'valaxy'
import { StyleValue, computed, defineAsyncComponent } from 'vue'
import { usePostProperty } from '../composables'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()

const runtimeConfig = useRuntimeConfig()
const siteConfig = useSiteConfig()

const { styles, icon, color } = usePostProperty(props.frontmatter.type)
const title = usePostTitle(computed(() => props.frontmatter))

const aside = computed(() => props.frontmatter.aside !== false)

// not import from 'valaxy-addon-waline' to judge
const YunWaline = runtimeConfig.value.addons['valaxy-addon-waline']
  ? defineAsyncComponent(() => import('./YunWaline.vue'))
  : () => null

// todo: refactor
const YunTwikoo = runtimeConfig.value.addons['valaxy-addon-twikoo']
  ? defineAsyncComponent(() => import('./YunTwikoo.vue'))
  : () => null
</script>

<template>
  <main class="yun-main lt-md:ml-0" flex="~">
    <div w="full" flex="~">
      <slot name="main">
        <div class="content" :class="!aside && 'no-aside'" flex="~ col grow" w="full" p="l-4 lt-md:0">
          <YunCard :cover="frontmatter.cover" m="0" class="relative" :style="styles as StyleValue">
            <slot name="main-header">
              <YunPageHeader :title="title" :icon="frontmatter.icon || icon" :color="frontmatter.color || color" :cover="frontmatter.cover" />
            </slot>
            <slot name="main-header-after" />

            <div p="x-4 b-8" class="sm:px-6 lg:px-12 xl:px-16" w="full">
              <slot name="main-content">
                <ValaxyMd :frontmatter="frontmatter">
                  <slot name="main-content-md" />
                  <slot />
                </ValaxyMd>
              </slot>

              <slot name="main-content-after" />
            </div>
          </YunCard>

          <slot name="main-nav-before" />

          <slot name="main-nav">
            <YunPostNav v-if="frontmatter.nav !== false" />
          </slot>

          <slot name="main-nav-after" />

          <slot v-if="siteConfig.comment.enable && frontmatter.comment !== false" name="comment">
            <YunCard w="full" p="4" class="comment sm:p-6 lg:px-12 xl:px-16" :class="frontmatter.nav === false ? 'mt-4' : 0">
              <YunWaline />
              <YunTwikoo />
            </YunCard>
          </slot>

          <slot name="main-footer-before" />
          <YunFooter />
          <slot name="main-footer-after" />
        </div>
      </slot>

      <slot name="aside">
        <YunAside v-if="aside">
          <slot name="aside-custom" />
        </YunAside>
      </slot>
    </div>
  </main>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins' as *;

@include media('md') {
  .yun-main {
    &.has-sidebar {
      padding-left: var(--va-sidebar-width);
    }
  }
}

@include media('xl') {
  .content{
    // 8px scrollbar width
    max-width: calc(100vw - 2 * var(--va-sidebar-width) - 1rem - 8px);

    &.no-aside {
      max-width: calc(100vw - var(--va-sidebar-width));
    }
  }
}
</style>
