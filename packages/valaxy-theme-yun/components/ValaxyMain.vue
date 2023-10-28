<script lang="ts" setup>
import { computed, nextTick } from 'vue'
import type { PageData, Post } from 'valaxy'
import { onContentUpdated, usePostTitle, useSiteConfig } from 'valaxy'
import type { StyleValue } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { scrollTo } from '../utils'
import { usePostProperty } from '../composables'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()

const siteConfig = useSiteConfig()

const { styles, icon, color } = usePostProperty(props.frontmatter.type)
const title = usePostTitle(computed(() => props.frontmatter))

const aside = computed(() => props.frontmatter.aside !== false)

const route = useRoute()
const router = useRouter()

nextTick(() => {
  if (route.hash) {
    setTimeout(() => {
      scrollTo(document.body, route.hash, true)
    }, 0)
  }
})

onContentUpdated(() => {
  // to extract
  // click title scroll
  window.addEventListener(
    'click',
    async (e) => {
      const link = (e.target as Element).closest('a')
      if (link) {
        const { protocol, hostname, pathname, hash, target } = link
        const currentUrl = window.location
        const extMatch = pathname.match(/\.\w+$/)
        // only intercept inbound links
        if (
          !e.ctrlKey
            && !e.shiftKey
            && !e.altKey
            && !e.metaKey
            && target !== '_blank'
            && protocol === currentUrl.protocol
            && hostname === currentUrl.hostname
            && !(extMatch && extMatch[0] !== '.html')
        ) {
          if (pathname === currentUrl.pathname) {
            e.preventDefault()
            // scroll between hash anchors in the same page
            if (hash && hash !== currentUrl.hash) {
              await router.push({ hash: decodeURIComponent(hash) })

              // use smooth scroll when clicking on header anchor links
              scrollTo(link, hash, link.classList.contains('header-anchor'))
            }
          }
        }
      }
    },
    { capture: true },
  )
})
</script>

<template>
  <main class="yun-main md:pl-$va-sidebar-width lt-md:ml-0" flex="~">
    <div w="full" flex="~">
      <slot name="main">
        <div class="content" :class="!aside && 'no-aside'" flex="~ col grow" w="full" p="l-4 lt-md:0">
          <YunCard :cover="frontmatter.cover" m="0" class="relative" :style="styles as StyleValue">
            <slot name="main-header">
              <YunPageHeader
                class="mb-2"
                :title="title"
                :icon="frontmatter.icon || icon" :color="frontmatter.color || color"
                :cover="frontmatter.cover"
              />
            </slot>
            <slot name="main-header-after" />

            <div p="x-4 b-8" class="sm:px-6 lg:px-12 xl:px-16" w="full">
              <slot name="main-content">
                <Transition appear>
                  <ValaxyMd :frontmatter="frontmatter">
                    <YunAiExcerpt v-if="frontmatter.excerpt_type === 'ai' && frontmatter.excerpt" />
                    <YunMdTimeWarning :frontmatter="frontmatter" />

                    <slot name="main-content-md" />
                    <slot />
                  </ValaxyMd>
                </Transition>
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
            <YunComment :class="frontmatter.nav === false ? 'mt-4' : 0" />
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
@use 'valaxy/client/styles/mixins/index.scss' as *;

@include screen('md') {
  .yun-main {
    &.has-sidebar {
      padding-left: var(--va-sidebar-width);
    }
  }
}

@include screen('xl') {
  .content{
    // 8px scrollbar width
    max-width: calc(100vw - 2 * var(--va-sidebar-width) - 1rem - 8px);

    &.no-aside {
      max-width: calc(100vw - var(--va-sidebar-width));
    }
  }
}
</style>
