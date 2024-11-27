<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import type { StyleValue } from 'vue'
import { onClickHref, onContentUpdated, scrollTo, usePostTitle, useSiteConfig } from 'valaxy'
import { computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
      scrollTo(document.body, route.hash, {
        smooth: true,
      })
    }, 0)
  }
})

onContentUpdated(() => {
  onClickHref(router)
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
        <YunCard :cover="frontmatter.cover" m="0" class="relative" :style="styles as StyleValue">
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

          <div p="x-4 b-8" class="sm:px-6 lg:px-12 xl:px-16" w="full">
            <slot name="main-content">
              <!-- <Transition appear> -->
              <ValaxyMd :frontmatter="frontmatter">
                <YunAiExcerpt v-if="frontmatter.excerpt_type === 'ai' && frontmatter.excerpt" />
                <YunMdTimeWarning />

                <slot name="main-content-md" />
                <slot />
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

        <slot name="main-footer-before" />
        <slot name="main-footer-after" />
      </div>
    </slot>
  </main>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

@include screen('xl') {
  .content{
    // 8px scrollbar width
    // max-width: calc(100vw - 2 * var(--va-sidebar-width) - 1rem - 8px);

    &.no-aside {
      max-width: calc(100vw - var(--va-sidebar-width));
    }
  }
}
</style>
