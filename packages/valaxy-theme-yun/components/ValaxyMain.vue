<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { onClickHref, scrollTo, usePostTitle, useSiteConfig } from 'valaxy'
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostProperty, useThemeConfig } from '../composables'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()

const siteConfig = useSiteConfig()
const themeConfig = useThemeConfig()

const { styles, icon, color } = usePostProperty(props.frontmatter.type)
const title = usePostTitle(computed(() => props.frontmatter))

const aside = computed(() => props.frontmatter.aside !== false)
const prosePreset = computed(() => props.frontmatter.prose || themeConfig.value.prose)

const route = useRoute()
const router = useRouter()

let cleanupClickHref: (() => void) | undefined

onMounted(() => {
  cleanupClickHref = onClickHref(router)
  if (route.hash) {
    setTimeout(() => {
      scrollTo(document.body, route.hash, {
        smooth: true,
      })
    }, 0)
  }
})

onUnmounted(() => {
  cleanupClickHref?.()
  cleanupClickHref = undefined
})
</script>

<template>
  <main
    class="yun-main lt-md:w-full" flex="~ center"
  >
    <slot name="main">
      <div
        class="content w-full md:w-3xl lg:w-2xl xl:w-2xl 2xl:w-4xl"
        :class="{
          'no-aside': !aside,
        }"
        flex="~ col grow"
        p="lt-md:0"
      >
        <YunCard
          :cover="frontmatter.cover" :cover-component="frontmatter.coverComponent" :cover-props="frontmatter.coverProps"
          class="yun-main-card"
          :class="{ 'is-draft': frontmatter.draft, 'has-post-status': Boolean(frontmatter.draft || frontmatter.hide || frontmatter.top) }"
          :data-yun-prose="prosePreset && prosePreset !== 'yun' ? prosePreset : undefined"
          m="0" v-bind="styles ? { style: styles } : {}"
        >
          <div class="yun-reading-actions">
            <div data-yun-author-note-actions />
            <YunPostActions />
          </div>
          <div class="mt-8 mb-4">
            <slot name="main-header">
              <YunPageHeader
                :title="title"
                :icon="frontmatter.icon || icon"
                :color="frontmatter.color || color"
                :cover="frontmatter.cover"
                :page-title-class="frontmatter.pageTitleClass"
              />
            </slot>
          </div>

          <slot name="main-header-after" />

          <div p="x-4 b-8" class="sm:px-6 md:px-10 lg:px-12 2xl:px-16" w="full">
            <slot name="main-content-before" />

            <slot name="main-content">
              <!-- <Transition appear> -->
              <ValaxyMd :frontmatter="frontmatter">
                <YunAiExcerpt v-if="frontmatter.excerpt_type === 'ai' && frontmatter.excerpt" />
                <ClientOnly>
                  <YunMdTimeWarning />
                </ClientOnly>

                <slot />
                <slot name="main-content-md" />
              </ValaxyMd>
              <!-- </Transition> -->
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

        <YunAdBoard class="yun-main-ad-board mt-4 lg:hidden" />

        <slot name="main-footer-before" />
        <slot name="main-footer-after" />
      </div>
    </slot>
  </main>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.yun-reading-actions {
  position: absolute;
  inset-block-start: 0.75rem;
  inset-inline-end: 0.75rem;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

@include screen('xl') {
  .content{
    // 8px scrollbar width
    // max-width: calc(100vw - 2 * var(--va-sidebar-width) - 1rem - 8px);

    &.no-aside {
      max-width: calc(100vw - var(--va-sidebar-width));
    }
  }
}

@media (width < 768px) {
  .yun-main > .content > .yun-card:first-child {
    border-inline: 0;
    border-radius: 0;
  }

  .yun-layout-wrapper-content:is(.has-local-outline, .has-local-menu) .yun-main > .content > .yun-card:first-child {
    border-top: 0;
  }

  .yun-main > .content > :is(.yun-comment, .yun-main-ad-board) {
    width: auto;
    margin-inline: 0.75rem;
  }
}

@media (width >= 1024px) {
  .yun-main > .content > .yun-main-ad-board {
    display: none;
  }
}
</style>
