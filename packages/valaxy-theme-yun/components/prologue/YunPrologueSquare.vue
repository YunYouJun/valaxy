<script setup lang="ts">
import { ref } from 'vue'
import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()

const showContent = ref(false)
</script>

<template>
  <div
    flex="~ col"
    class="yun-square-container items-center justify-center text-center max-w-2xl"
  >
    <slot />

    <div
      flex="~ col center"
      class="info-with-avatar relative duration-800 transition-cubic-bezier-ease-in"
      :class="{
        show: showContent,
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
          class="yun-square square-rotate z-1 bg-white/80"
        >
          <LineBurstEffects
            class="absolute top-0 left-0 right-0 bottom-0 size-full scale-200"
            :delay="200"
            :duration="400"
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

      <div
        class="info"
        :class="{
          show: showContent,
        }"
      >
        <YunAuthorName class="mt-3" />
        <YunAuthorIntro />

        <div
          flex="~ col"
          class="gap-2 items-center justify-center"
          my-4 md:my-5 lg:my-6
          py-4 md:py-6
          border="t-1px b-1px black/60 dark:white/60"
        >
          <YunSiteTitle />
          <YunSiteSubtitle />
          <YunSiteDescription />
        </div>

        <YunSocialLinks />

        <div
          class="mt-4 flex-center w-72 md:w-150 m-auto gap-2"
          flex="~ wrap"
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
// use scoped for css injection
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.yun-square {
  transition: all 0.8s map.get($cubic-bezier, 'ease-in');
  border-radius: 50%;
  transform: rotate(0deg) translateY(0%);
  width: var(--avatar-size);
  height: var(--avatar-size);
  box-shadow: 0 5px 100px rgb(0 0 0 / 0.15);

  &.enter-from {
    border-radius: 0%;
    // width: var(--total-char-height);
    // height: var(--total-char-height);
    transform: rotate(135deg) translateY(0%);
    box-shadow: none;
  }
}

.yun-square-container {
  --avatar-size: 100px;

  .info-with-avatar {
    position: relative;

    &.show {
      // transform: translateY(-50%);
    }
  }

  .info {
    position: relative;
    opacity: 0;
    transform: translateY(0);
    transition: all 0.8s map.get($cubic-bezier, 'ease-in');

    &.show {
      opacity: 1;
      // transform: translateY(calc(50% + var(--avatar-size) / 2));
    }
  }
}
</style>
