<script lang="ts" setup>
import type { PageData, Post } from 'valaxy'
import { useConfig, usePostProperty, usePostTitle } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  frontmatter: Post
  data?: PageData
}>()
const config = useConfig()

const { styles, icon, color } = usePostProperty(props.frontmatter.type)
const title = usePostTitle(computed(() => props.frontmatter))
</script>

<template>
  <main class="yun-main lt-md:ml-0" flex="~">
    <div w="full" flex="~">
      <slot name="main">
        <div class="content" flex="~ col grow" w="full" p="l-4 lt-md:0">
          <YunCard :cover="frontmatter.cover" m="0" class="relative" :style="styles">
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

          <slot v-if="frontmatter.comment !== false" name="comment">
            <YunCard w="full" p="4" class="comment sm:p-6 lg:px-12 xl:px-16" :class="frontmatter.nav === false ? 'mt-4' : 0">
              <YunWaline v-if="config.comment.waline.enable" />
              <YunTwikoo v-if="config.comment.twikoo.enable" />
            </YunCard>
          </slot>

          <ValaxyFooter>
            <slot name="footer" />
          </ValaxyFooter>
        </div>
      </slot>

      <slot name="aside">
        <YunAside :frontmatter="frontmatter" :data="data">
          <slot name="aside-custom" />
        </YunAside>
      </slot>
    </div>
  </main>
</template>

<style lang="scss">
@use '~/styles/mixins' as *;
@include xl {
  .content{
    // 8px scrollbar width
    max-width: calc(100vw - 2 * var(--va-sidebar-width-mobile) - 1rem - 8px);
  }
}
</style>
