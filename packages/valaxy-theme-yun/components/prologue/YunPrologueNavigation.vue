<script setup lang="ts">
import type { PageProps, YunTheme } from '../../types'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeConfig } from '../../composables'

const props = defineProps<{
  variant?: YunTheme.HomeNavStyle
  /** Use the mobile layout when embedded in a narrow surface. */
  compact?: boolean
  pages?: PageProps[]
}>()

const themeConfig = useThemeConfig()
const { t } = useI18n()
const variant = computed(() => props.variant ?? themeConfig.value.banner?.navStyle ?? 'plain')
const pages = computed(() => props.pages ?? themeConfig.value.pages)
</script>

<template>
  <nav
    class="prologue-navigation mt-4 flex-center w-full max-w-88 md:w-150 md:max-w-none m-auto gap-2"
    :class="{ 'is-compact': compact }"
    :data-style="variant"
    :aria-label="t('menu.home')"
    flex="~ wrap"
  >
    <YunSiteLinkItem :page="{ name: t('menu.posts'), icon: 'i-ri-article-line', url: '/posts/' }" />
    <slot />
    <YunSiteLinkItem v-for="item, i in pages" :key="`${item.url}-${i}`" :page="item" />
  </nav>
</template>

<style lang="scss" scoped>
@use '../../styles/mixins/glass';

@mixin mobile-navigation {
  --yun-nav-panel-shadow: rgb(30 45 60 / 0.08);

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 6px;
  box-sizing: border-box;
  width: 100%;
  max-width: 352px;

  html.dark & {
    --yun-nav-panel-shadow: rgb(0 0 0 / 0.2);
  }

  :deep(.yun-site-link-item) {
    position: relative;
    box-sizing: border-box;
    justify-content: flex-start;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    padding: 8px 10px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    font-size: 15px;
    font-weight: 500;
    transition: background-color 160ms ease, box-shadow 160ms ease, transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  :deep(.yun-site-link-item:last-child:nth-child(odd)) {
    grid-column: 1 / -1;
    justify-content: center;
  }

  :deep(.yun-site-link-item .icon) {
    flex: none;
    width: 20px;
    height: 20px;
    color: var(--yun-site-link-accent);
  }

  :deep(.yun-site-link-label) {
    min-width: 0;
    color: var(--va-c-text);
    line-height: 1.3;
    text-align: left;
    overflow-wrap: anywhere;
  }

  :deep(.yun-site-link-item:focus-visible) {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
    z-index: 1;
  }

  :deep(.yun-site-link-item:active) {
    background-color: color-mix(in srgb, var(--va-c-text) 8%, transparent);
    transform: scale(0.98);
  }

  &[data-style="plain"] {
    @media (hover: hover) and (pointer: fine) {
      :deep(.yun-site-link-item:hover:not(:active)) {
        background-color: color-mix(in srgb, var(--va-c-text) 4%, transparent);
      }
    }
  }

  &[data-style="panel"] {
    gap: 0;
    padding: 8px;
    border: 1px solid color-mix(in srgb, var(--va-c-text) 9%, transparent);
    border-radius: 24px;
    background: color-mix(in srgb, var(--va-c-bg) 76%, transparent);
    box-shadow: 0 4px 18px var(--yun-nav-panel-shadow);
    /* stylelint-disable-next-line property-no-vendor-prefix -- Legacy Safari */
    -webkit-backdrop-filter: blur(18px);
    backdrop-filter: blur(18px);

    :deep(.yun-site-link-item) {
      padding-inline: 10px;
      border-radius: 0;
      border-bottom-color: color-mix(in srgb, var(--va-c-text) 9%, transparent);
    }

    :deep(.yun-site-link-item:nth-child(odd):not(:last-child)) {
      border-right-color: color-mix(in srgb, var(--va-c-text) 9%, transparent);
    }

    :deep(.yun-site-link-item:last-child),
    :deep(.yun-site-link-item:nth-last-child(2):nth-child(odd)) {
      border-bottom-color: transparent;
    }
  }

  &[data-style="tiles"] {
    :deep(.yun-site-link-item) {
      min-height: 52px;
      padding: 8px;
    }

    :deep(.yun-site-link-icon) {
      width: 32px;
      height: 32px;
      border-radius: 11px;
      background: color-mix(in srgb, var(--yun-site-link-accent) 13%, transparent);
    }
  }

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    &[data-style="panel"] {
      border-color: color-mix(in srgb, var(--va-c-text) 50%, transparent);
      background: var(--va-c-bg);
      box-shadow: none;
      /* stylelint-disable-next-line property-no-vendor-prefix -- Legacy Safari */
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }

    &:not([data-style="glass"]) :deep(.yun-site-link-item:active) {
      background-color: color-mix(in srgb, var(--va-c-bg) 90%, var(--va-c-text));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.yun-site-link-item) { transition: none; }
    :deep(.yun-site-link-item:active) { transform: none; }
  }
}

.prologue-navigation.is-compact {
  @include mobile-navigation;
}

@media (width <= 639px) {
  .prologue-navigation {
    @include mobile-navigation;
  }
}

.prologue-navigation[data-style="glass"] {
  :deep(.yun-site-link-item) {
    @include glass.surface;
    @include glass.edge;

    position: relative;
    border-radius: 999px;
    transition: background-color 180ms ease, border-color 180ms ease, box-shadow 220ms ease, transform 220ms ease;
  }

  :deep(.yun-site-link-item .icon) {
    color: var(--yun-site-link-accent);
  }

  :deep(.yun-site-link-item:focus-visible) {
    outline: 2px solid var(--yun-focus-color);
    outline-offset: 2px;
    z-index: 1;
  }

  @media (hover: hover) and (pointer: fine) {
    :deep(.yun-site-link-item:hover:not(:active)) {
      background-color: color-mix(in srgb, var(--yun-site-link-accent) 12%, var(--yun-glass-hover-fill));
      border-color: color-mix(in srgb, var(--yun-site-link-accent) 36%, var(--yun-glass-border));
      box-shadow: var(--yun-glass-hover-shadow);
      transform: translateY(-1px);
    }
  }

  :deep(.yun-site-link-item:active) {
    background-color: var(--yun-glass-pressed-fill);
    box-shadow: var(--yun-glass-pressed-shadow);
    transform: scale(0.98);
  }

  @media (prefers-reduced-transparency: reduce), (prefers-contrast: more) {
    :deep(.yun-site-link-item),
    :deep(.yun-site-link-item:hover:not(:active)),
    :deep(.yun-site-link-item:active) {
      @include glass.solid;

      &::before {
        display: none;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    :deep(.yun-site-link-item),
    :deep(.yun-site-link-item:hover:not(:active)),
    :deep(.yun-site-link-item:active) {
      transform: none;
      transition: none;
    }
  }
}

@media (width > 639px) {
  .prologue-navigation[data-style="glass"]:not(.is-compact) {
    width: min(100%, 37.5rem);
    max-width: 37.5rem;
    gap: 0.625rem;

    :deep(.yun-site-link-item) {
      gap: 0.45rem;
      padding: 0.45rem 0.95rem;
      font-size: 0.9375rem;
      font-weight: 500;
      line-height: 1.4;
    }

    :deep(.yun-site-link-item .icon) {
      width: 1.125rem;
      height: 1.125rem;
    }
  }
}
</style>
