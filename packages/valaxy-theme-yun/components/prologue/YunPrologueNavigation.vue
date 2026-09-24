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
@mixin mobile-navigation {
  --yun-nav-glass-fill: rgb(255 255 255 / 0.22);
  --yun-nav-glass-pressed: rgb(255 255 255 / 0.5);
  --yun-nav-glass-edge: rgb(255 255 255 / 0.85);
  --yun-nav-glass-shadow: rgb(30 45 60 / 0.08);

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 8px;
  box-sizing: border-box;
  width: 100%;
  max-width: 352px;

  html.dark & {
    --yun-nav-glass-fill: rgb(255 255 255 / 0.06);
    --yun-nav-glass-pressed: rgb(255 255 255 / 0.14);
    --yun-nav-glass-edge: rgb(255 255 255 / 0.3);
    --yun-nav-glass-shadow: rgb(0 0 0 / 0.2);
  }

  :deep(.yun-site-link-item) {
    position: relative;
    box-sizing: border-box;
    justify-content: flex-start;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    padding: 10px 12px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    font-size: 16px;
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

  &[data-style="glass"] {
    :deep(.yun-site-link-item) {
      padding-inline: 16px;
      border-color: color-mix(in srgb, var(--va-c-text) 8%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--va-c-bg) 88%, transparent);
      box-shadow: inset 0 1px 1px rgb(255 255 255 / 0.12), 0 3px 12px var(--yun-nav-glass-shadow);

      @supports ((backdrop-filter: blur(14px)) or (-webkit-backdrop-filter: blur(14px))) {
        background-color: var(--yun-nav-glass-fill);
        /* stylelint-disable-next-line property-no-vendor-prefix -- Legacy Safari */
        -webkit-backdrop-filter: blur(14px) saturate(140%);
        backdrop-filter: blur(14px) saturate(140%);
      }
    }

    @supports (mask-composite: exclude) {
      :deep(.yun-site-link-item::before) {
        content: "";
        position: absolute;
        inset: -1px;
        padding: 1px;
        border-radius: inherit;
        background: linear-gradient(150deg, var(--yun-nav-glass-edge), transparent 38%, transparent 62%, var(--yun-nav-glass-edge));
        mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
        mask-composite: exclude;
        pointer-events: none;
      }
    }

    :deep(.yun-site-link-item:active) {
      background-color: var(--yun-nav-glass-pressed);
      box-shadow: inset 0 1px 4px var(--yun-nav-glass-shadow);
    }
  }

  &[data-style="panel"] {
    gap: 0;
    padding: 8px;
    border: 1px solid color-mix(in srgb, var(--va-c-text) 9%, transparent);
    border-radius: 24px;
    background: color-mix(in srgb, var(--va-c-bg) 76%, transparent);
    box-shadow: 0 4px 18px var(--yun-nav-glass-shadow);
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
    &[data-style="panel"],
    &[data-style="glass"] :deep(.yun-site-link-item) {
      border-color: color-mix(in srgb, var(--va-c-text) 50%, transparent);
      background: var(--va-c-bg);
      box-shadow: none;
      /* stylelint-disable-next-line property-no-vendor-prefix -- Legacy Safari */
      -webkit-backdrop-filter: none;
      backdrop-filter: none;
    }

    :deep(.yun-site-link-item::before) { display: none; }

    &[data-style] :deep(.yun-site-link-item:active) {
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
</style>
