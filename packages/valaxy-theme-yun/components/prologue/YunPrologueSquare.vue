<script setup lang="ts">
import { computed, ref } from 'vue'

import { useThemeConfig } from '../../composables'

const themeConfig = useThemeConfig()

const showContent = ref(false)
const grouped = computed(() => themeConfig.value.banner?.prologue === 'grouped')
</script>

<template>
  <div
    flex="~ col"
    class="yun-square-container items-center justify-center text-center max-w-2xl"
    :class="{ 'is-grouped': grouped }"
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
          class="yun-square square-rotate z-1"
        >
          <LineBurstEffects
            class="size-full"
            :delay="200"
            :duration="500"
          />
          <Transition
            enter-from-class="op-0"
            enter-to-class="op-100"
            enter-active-class="transition-400 delay-200"
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

        <div :class="grouped ? 'prologue-divider' : 'py-4 md:py-5 lg:pt-6'">
          <YunAnimLineDraw :active="showContent" />
        </div>
        <div
          flex="~ col"
          class="prologue-introduction gap-2 items-center justify-center"
        >
          <YunSiteTitle />
          <YunSiteSubtitle />
          <YunSiteDescription />
        </div>
        <div class="scale-x--100" :class="grouped ? 'prologue-divider' : 'py-4 md:py-5 lg:pb-6'">
          <YunAnimLineDraw :active="showContent" />
        </div>

        <YunSocialLinks class="prologue-social" />

        <YunPrologueNavigation>
          <slot />
        </YunPrologueNavigation>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// use scoped for css injection

.yun-square {
  --yun-avatar-burst-color: color-mix(in srgb, var(--va-c-primary) 65%, var(--va-c-text));

  background: var(--va-c-bg-soft);
  transition: opacity 640ms var(--yun-reveal-ease), transform 640ms var(--yun-reveal-ease);
  border-radius: 50%;
  transform: rotate(0deg) translateY(0%);
  width: var(--avatar-size);
  height: var(--avatar-size);
  box-shadow: 0 5px 100px rgb(0 0 0 / 0.15);

  &.enter-from {
    opacity: 0;

    // width: var(--total-char-height);
    // height: var(--total-char-height);
    transform: translateY(20px) rotate(-6deg);
    box-shadow: none;
  }
}

.yun-square-container {
  --avatar-size: 100px;
  --yun-reveal-ease: cubic-bezier(0.22, 1, 0.36, 1);

  .info-with-avatar {
    position: relative;

    &.show {
      // transform: translateY(-50%);
    }
  }

  .info {
    position: relative;
    visibility: hidden;

    > * {
      opacity: 0;
      transform: translateY(18px);
      transition: opacity 640ms var(--yun-reveal-ease), transform 720ms var(--yun-reveal-ease);
      transition-delay: var(--yun-reveal-delay, 0ms);
    }

    .prologue-introduction { --yun-reveal-delay: 70ms; }
    .prologue-social { --yun-reveal-delay: 140ms; }
    .prologue-navigation { --yun-reveal-delay: 210ms; }

    &.show {
      visibility: visible;

      > * {
        opacity: 1;
        transform: none;
      }
    }
  }

}

.yun-square-container.is-grouped {
  .prologue-divider {
    position: relative;
    width: min(var(--yun-prologue-divider-width, 320px), calc(100% - 32px));
    height: 1px;
    margin: 20px auto;
    mask-image: linear-gradient(to right, transparent, black 20%, black 80%, transparent);
  }

  .prologue-navigation {
    margin-top: 32px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .yun-square,
  .yun-square.enter-from {
    transform: none;
    border-radius: 50%;
    transition: opacity 150ms ease;
  }

  .yun-square :deep(.yun-author-avatar) {
    transition-delay: 0ms;
    transition-duration: 150ms;
  }

  .info-with-avatar,
  .yun-square-container .info > * {
    transform: none;
    transition: opacity 150ms ease;
  }
}
</style>
