<script setup lang="ts">
import { computed } from 'vue'

import { useThemeConfig } from '../../composables'

const props = withDefaults(defineProps<{
  introComplete?: boolean
}>(), {
  introComplete: true,
})

const themeConfig = useThemeConfig()

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
      class="info-with-avatar relative"
    >
      <div
        flex="~ col"
        class="yun-square square-rotate z-1"
      >
        <LineBurstEffects
          v-if="props.introComplete"
          class="size-full"
          :delay="200"
          :duration="500"
        />
        <YunAuthorAvatar />
      </div>

      <div class="info">
        <YunAuthorName class="mt-3" />
        <YunAuthorIntro />

        <div :class="grouped ? 'prologue-divider' : 'py-4 md:py-5 lg:pt-6'">
          <YunAnimLineDraw :active="props.introComplete" />
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
          <YunAnimLineDraw :active="props.introComplete" />
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

  position: relative;
  background: var(--va-c-bg-soft);
  border-radius: 50%;
  width: var(--avatar-size);
  height: var(--avatar-size);
  box-shadow: 0 5px 100px rgb(0 0 0 / 0.15);
}

.yun-square-container {
  --avatar-size: 100px;

  .info {
    position: relative;
  }
}

.prologue-social {
  max-width: 34rem;
  margin-inline: auto;
  gap: 0.125rem;

  :deep(.links-of-author-item) {
    width: 2.35rem;
    height: 2.35rem;
  }

  :deep(.links-of-author-item .icon) {
    width: 1.2rem;
    height: 1.2rem;
    color: color-mix(in srgb, currentcolor 48%, var(--yun-social-soft-base));
    transition: color var(--va-transition-duration) ease, transform var(--va-transition-duration) ease;
  }

  @mixin highlight-social-link {
    background-color: color-mix(in srgb, currentcolor 13%, transparent);
    box-shadow: 0 0 12px color-mix(in srgb, currentcolor 22%, transparent);

    .icon {
      color: inherit;

      @media (prefers-reduced-motion: no-preference) {
        transform: translateY(-1px) scale(1.1);
      }

      html.dark & {
        filter: brightness(1.22);
      }
    }
  }

  :deep(.links-of-author-item:focus-visible) {
    @include highlight-social-link;
  }

  @media (hover: hover) and (pointer: fine) {
    :deep(.links-of-author-item:hover) {
      @include highlight-social-link;
    }
  }

  @media (pointer: coarse) {
    :deep(.links-of-author-item) {
      width: 2.75rem;
      height: 2.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.links-of-author-item),
    :deep(.links-of-author-item .icon) {
      transition: none;
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
</style>
