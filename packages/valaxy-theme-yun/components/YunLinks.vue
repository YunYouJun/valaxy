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
  <div class="yun-links not-prose">
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
    --yun-link-accent: var(--primary-color, var(--va-c-link));
    --yun-link-accent-ink: var(--yun-link-accent);

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
    text-decoration: none;
    line-height: 1.5;
    background-color: var(--yun-bg-elevated, var(--va-c-bg-light));
    background-image: radial-gradient(
      220px circle at 0% 0%,
      color-mix(in srgb, var(--yun-link-accent) 9%, transparent),
      transparent 72%
    );
    border: 1px solid var(--yun-surface-line);
    border-radius: 0.75rem;
    box-shadow: var(--yun-card-shadow);
    transition:
      transform 220ms var(--yun-ease-in-out, ease),
      border-color 220ms ease,
      box-shadow 220ms ease;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        color: var(--va-c-text);
        text-decoration: none;
        border-color: color-mix(in srgb, var(--yun-link-accent) 34%, var(--yun-surface-line));
        box-shadow: var(--yun-card-hover-shadow);

        @media (prefers-reduced-motion: no-preference) {
          transform: translateY(-2px);

          .yun-link-avatar {
            transform: scale(1.04);
          }
        }

        .yun-link-avatar {
          border-color: color-mix(in srgb, var(--yun-link-accent) 48%, var(--yun-surface-line));
        }

        .yun-link-blog {
          color: var(--yun-link-accent-ink);
        }

        .yun-link-arrow {
          color: var(--yun-link-accent-ink);
          opacity: 1;
          transform: translate(1px, -1px);
        }
      }
    }

    &:focus-visible {
      color: var(--va-c-text);
      text-decoration: none;
      border-color: var(--yun-surface-line);
      outline: 2px solid var(--yun-focus-color);
      outline-offset: 2px;
    }

    &:active {
      @media (prefers-reduced-motion: no-preference) {
        transform: scale(0.985);
      }
    }

    .yun-link {
      &-left {
        position: relative;
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
        background-color: color-mix(in srgb, var(--yun-link-accent) 8%, var(--va-c-bg-soft));
        border: 1px solid color-mix(in srgb, var(--yun-link-accent) 28%, var(--yun-surface-line));
        transition:
          transform 220ms var(--yun-ease-in-out, ease),
          border-color 220ms ease;
      }

      &-avatar-img {
        width: 100%;
        height: 100%;
        margin: 0 !important;
        object-fit: cover;
        object-position: center;
      }

      &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.375rem;
        min-width: 0;
      }

      &-blog {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        color: var(--va-c-text);
        font-family: var(--va-font-serif);
        font-size: 1rem;
        font-weight: 700;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: color 180ms ease;
      }

      &-arrow {
        flex-shrink: 0;
        color: var(--va-c-text-2);
        font-size: 0.9rem;
        opacity: 0.45;
        transition:
          color 180ms ease,
          opacity 180ms ease,
          transform 180ms ease;
      }

      &-desc {
        display: -webkit-box;
        overflow: hidden;
        color: var(--va-c-text-2);
        font-size: 0.85rem;
        line-height: 1.5;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
      }
    }
  }

  .yun-link-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    min-width: 0;
    flex: 1;
  }
}

html.dark .yun-links .yun-link-url {
  --yun-link-accent-ink: color-mix(in srgb, var(--yun-link-accent) 62%, white);

  background-image: radial-gradient(
    220px circle at 0% 0%,
    color-mix(in srgb, var(--yun-link-accent) 14%, transparent),
    transparent 72%
  );
}

@media (prefers-reduced-motion: reduce) {
  .yun-links {
    .yun-link-url,
    .yun-link-avatar,
    .yun-link-blog,
    .yun-link-arrow {
      transition: none;
    }
  }
}
</style>
