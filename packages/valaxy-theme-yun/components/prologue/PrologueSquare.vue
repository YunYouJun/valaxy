<script setup lang="ts">
import { ref } from 'vue'
import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()

const showContent = ref(false)
</script>

<template>
  <div
    flex="~ col"
    class="yun-square-container items-center justify-center text-center"
    :class="{
      'size-$total-char-height': !showContent,
    }"
  >
    <slot />

    <div
      flex="~ col center"
      class="info relative duration-800 transition-cubic-bezier-ease-in"
      :class="{
        'translate-y--1/2': showContent,
      }"
    >
      <Transition
        enter-from-class="enter-from"
        enter-to-class="enter-to"
        appear
        @after-appear="showContent = true"
      >
        <div
          flex="~ col"
          class="absolute yun-square bg-$va-c-text square-rotate w-full z-1"
        >
          <LineBurstEffects
            class="absolute top-0 left-0 right-0 bottom-0 size-full scale-200"
            :delay="1000"
            :duration="600"
          />
          <Transition
            enter-from-class="op-0"
            enter-to-class="op-100"
            enter-active-class="transition-400 delay-400"
            appear
          >
            <YunAuthorAvatar />
          </Transition>
        </div>
      </Transition>

      <Transition
        enter-from-class="translate-y-0"
        enter-active-class="duration-800 transition-cubic-bezier-ease-in"
        appear
      >
        <div v-if="showContent" class="translate-y-[calc(50%+50px)] animate-fade-in">
          <YunAuthorName class="mt-3" />
          <YunAuthorIntro />

          <YunDivider />

          <div flex="~ col" class="gap-2 items-center justify-center">
            <YunSiteTitle />
            <YunSiteSubtitle />
            <YunSiteDescription />
          </div>

          <YunDivider />

          <div
            class="mt-4 flex-center w-64 md:w-100 m-auto gap-2"
            flex="~ wrap"
            p="x-$rect-margin"
          >
            <YunSiteLinkItem
              :page="{
                name: '博客文章',
                icon: 'i-ri-article-line',
                url: '/posts/',
              }"
            />
            <slot />
            <YunSiteLinkItem
              v-for="item, i in themeConfig.pages"
              :key="i" :page="item"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.yun-square {
  transition: all 0.8s map.get($cubic-bezier, 'ease-in');
  border-radius: 50%;
  transform: rotate(0deg) translateY(0%);
  width: 100px;
  height: 100px;
  box-shadow: 0 5px 100px rgb(0 0 0 / 0.15);

  &.enter-from {
    border-radius: 0%;
    width: var(--total-char-height);
    height: var(--total-char-height);
    transform: rotate(135deg) translateY(0%);
    box-shadow: none;
  }
}
</style>
