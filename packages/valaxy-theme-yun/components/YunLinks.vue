<script lang="ts" setup>
import type { LinkType } from '../types'
import { computed } from 'vue'
import { useRandomData } from '../composables'

const props = defineProps<{
  links: string | LinkType[]
  random: boolean
  /**
   * @description: 图片加载失败时显示的图片
   */
  errorImg?: string
}>()

const { data } = useRandomData(props.links, props.random)

/**
 * When links source is a URL (string), data is fetched asynchronously on the
 * client side only.  During SSG the list is empty, but after hydration the
 * fetched items are injected into the DOM.  Wrapping the list in
 * `<ClientOnly>` avoids a hydration-mismatch between the static (empty) HTML
 * and the client-rendered (populated) list, which could cause `replaceChild`
 * errors or the list not appearing at all.
 *
 * For static array data the mismatch risk is lower (SSR and client render
 * the same initial order), so `<ClientOnly>` is not applied.
 */
const isUrlSource = computed(() => typeof props.links === 'string')
</script>

<template>
  <div class="yun-links">
    <!--
      Use ClientOnly when links are fetched from a URL to prevent
      hydration mismatch (SSG renders empty list, client fills it).
    -->
    <ClientOnly v-if="isUrlSource">
      <ul class="yun-link-items">
        <YunLinkItem
          v-for="link in data"
          :key="link.url"
          :link="link" :error-img="errorImg"
        />
      </ul>
    </ClientOnly>
    <ul v-else class="yun-link-items">
      <YunLinkItem
        v-for="link in data"
        :key="link.url"
        :link="link" :error-img="errorImg"
      />
    </ul>
  </div>
</template>

<style lang="scss">
.yun-links {
  .yun-link-items {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
    padding-left: 0;
    list-style: none;
  }

  .yun-link-item {
    display: flex;
    min-width: 0;
  }

  .yun-link-url {
    --yun-link-accent: var(--primary-color, var(--va-c-primary));

    position: relative;
    display: flex;
    align-items: center;
    gap: 0.875rem;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    min-height: 5.5rem;
    padding: 0.875rem 1rem;
    overflow: hidden;
    color: var(--va-c-text);
    text-align: left;
    line-height: 1.5;
    background-color: var(--va-c-bg-light);
    border: 1px solid var(--va-c-border);
    border-radius: 0.75rem;
    box-shadow: inset 3px 0 0 var(--yun-link-accent);
    isolation: isolate;
    transition:
      transform var(--va-transition-duration-fast) ease,
      border-color var(--va-transition-duration-fast) ease,
      background-color var(--va-transition-duration-fast) ease,
      box-shadow var(--va-transition-duration-fast) ease;

    &::before {
      position: absolute;
      z-index: 0;
      inset: 0;
      pointer-events: none;
      background:
        radial-gradient(
          circle at 3.25rem 50%,
          color-mix(in srgb, var(--yun-link-accent) 18%, transparent) 0,
          color-mix(in srgb, var(--yun-link-accent) 7%, transparent) 42%,
          transparent 74%
        );
      content: '';
      opacity: 0;
      transition: opacity var(--va-transition-duration-fast) ease;
    }

    &:hover {
      color: var(--va-c-text);
      background-color: var(--va-c-bg-soft);
      box-shadow:
        inset 3px 0 0 var(--yun-link-accent),
        0 10px 28px rgb(0 0 0 / 0.1);
      transform: translateY(-2px);
    }

    &:hover::before,
    &:focus-visible::before {
      opacity: 1;
    }

    &:hover:not(:focus-visible) {
      border-color: var(--yun-link-accent);
    }

    &:focus-visible {
      color: var(--va-c-text);
      border-color: var(--va-c-border);
      outline: 2px solid var(--va-c-primary);
      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.985);
    }

    .yun-link {
      &-left {
        position: relative;
        z-index: 1;
        flex: 0 0 auto;
        line-height: 0;
      }

      &-avatar {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3.5rem;
        height: 3.5rem;
        overflow: hidden;
        border-radius: 50%;
        background-color: #fff;
        border: 2px solid var(--yun-link-accent);
        transition: transform var(--va-transition-duration-fast) ease;
      }

      &-avatar-img {
        width: 100%;
        height: 100%;
        margin: 0 !important;
        object-fit: cover;
        object-position: center;
      }

      &-blog {
        overflow: hidden;
        color: var(--va-c-text);
        font-family: var(--va-font-serif);
        font-size: 1rem;
        font-weight: 700;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      &-desc {
        display: -webkit-box;
        overflow: hidden;
        color: var(--va-c-text-light);
        font-size: 0.875rem;
        line-height: 1.4;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }

    &:hover .yun-link-avatar {
      transform: scale(1.04);
    }
  }

  .yun-link-info {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.125rem;
    min-width: 0;
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .yun-links {
    .yun-link-url,
    .yun-link-avatar,
    .yun-link-url::before {
      transition-duration: 0.01ms;
    }

    .yun-link-url:hover,
    .yun-link-url:active,
    .yun-link-url:hover .yun-link-avatar {
      transform: none;
    }
  }
}
</style>
