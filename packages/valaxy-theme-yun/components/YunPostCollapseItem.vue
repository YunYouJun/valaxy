<script setup lang="ts">
import type { MotionVariants } from '@vueuse/motion'
import type { Post } from 'valaxy'
import { formatDate, useValaxyI18n } from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { normalizeTransitionPath } from '../utils/routeTransition'

const props = defineProps<{
  i: number
  post: Post
}>()

const skipEnterMotion = typeof window !== 'undefined'
  && typeof document !== 'undefined'
  && (
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    || document.documentElement.classList.contains('yun-route-transition')
  )

const show = ref(skipEnterMotion)

const motionVariants: MotionVariants<never> = {
  initial: skipEnterMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: skipEnterMotion ? 0 : 180,
      delay: skipEnterMotion ? 0 : Math.min(props.i, 8) * 20,
      onComplete() {
        show.value = true
      },
    },
  },
}

const { t } = useI18n()
const { $tO } = useValaxyI18n()
</script>

<template>
  <article
    v-motion="motionVariants"
    class="post-item relative"
    :class="{ show }"
  >
    <RouterLink :to="post.path || ''" class="yun-timeline-row">
      <time v-if="post.date" class="yun-timeline-row-date" font="mono">
        {{ formatDate(post.date, { template: 'MM-DD' }) }}
      </time>
      <span class="post-title yun-timeline-row-title">
        <span v-if="post._collection" i-ri-book-2-line class="yun-timeline-row-icon" aria-hidden="true" />
        <span
          class="yun-timeline-row-title-text"
          :data-yun-vt-post-path="normalizeTransitionPath(post.path)"
        >{{ $tO(post.title) }}</span>
      </span>
      <span v-if="post._collection" class="yun-timeline-row-badge">{{ t('theme.collectionBadge') }}</span>
    </RouterLink>
  </article>
</template>

<style lang="scss">
.post-collapse {
  .post-item {
    position: relative;

    &::before {
      content: '';
      position: absolute;
      top: 1.38rem;
      left: 2px;
      z-index: 2;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      border: 1.5px solid color-mix(in srgb, var(--va-c-text-3) 55%, var(--yun-surface-line));
      background-color: var(--va-c-bg-light);
      transform: translateY(-50%);
      transition:
        border-color 180ms ease,
        background-color 180ms ease,
        transform 180ms ease;
    }

    &::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 1.75rem;
      height: 1px;
      background-color: color-mix(in srgb, var(--yun-surface-line) 72%, transparent);
      pointer-events: none;
    }

    &:last-child::after {
      display: none;
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover::before {
        border-color: var(--va-c-link);
        background-color: var(--va-c-link);
        transform: translateY(-50%) scale(1.18);
      }
    }
  }

  .yun-timeline-row {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    width: calc(100% - 1.125rem);
    margin-left: 1.125rem;
    padding: 0.65rem 0.75rem 0.65rem 0.625rem;
    border-radius: 0.5rem;
    color: inherit;
    text-decoration: none;
    transition: background-color 180ms ease;

    &:active {
      background-color: color-mix(in srgb, var(--va-c-link) 8%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--yun-focus-color);
      outline-offset: -2px;
    }
  }

  .yun-timeline-row-date {
    flex-shrink: 0;
    min-width: 3rem;
    font-size: 0.8125rem;
    letter-spacing: 0.02em;
    color: var(--va-c-text-2);
    font-variant-numeric: tabular-nums;
  }

  .yun-timeline-row-title {
    display: inline-flex;
    align-items: baseline;
    gap: 0.375rem;
    flex: 1;
    min-width: 0;
    font-family: var(--va-font-serif);
    font-size: 0.975rem;
    font-weight: 550;
    line-height: 1.5;
    color: var(--va-c-text);
  }

  .yun-timeline-row-icon {
    position: relative;
    top: 0.15em;
    flex-shrink: 0;
    width: 1.05em;
    height: 1.05em;
    margin-top: -0.15em;
    opacity: 0.65;
  }

  .yun-timeline-row-title-text {
    display: inline-block;
    width: fit-content;
    min-width: 0;
    overflow-wrap: anywhere;
    transition:
      color 180ms ease,
      transform 180ms cubic-bezier(0.22, 1, 0.36, 1);
  }

  @media (hover: hover) and (pointer: fine) {
    .yun-timeline-row:hover {
      background-color: color-mix(in srgb, var(--va-c-link) 5%, transparent);

      .yun-timeline-row-title-text {
        color: var(--va-c-link);
        transform: translateX(2px);
      }
    }
  }

  .yun-timeline-row-badge {
    align-self: center;
    flex-shrink: 0;
    padding: 0.1rem 0.45rem;
    border: 1px solid var(--yun-surface-line);
    border-radius: 999px;
    background-color: color-mix(in srgb, var(--va-c-bg-soft) 75%, transparent);
    color: var(--va-c-text-2);
    font-size: 0.6875rem;
    line-height: 1.4;
  }

  @media (prefers-reduced-motion: reduce) {
    .post-item {
      opacity: 1 !important;
      transform: none !important;

      &::before {
        transition: none;
      }
    }

    .yun-timeline-row,
    .yun-timeline-row-title-text {
      transition: none;
    }

    @media (hover: hover) and (pointer: fine) {
      .post-item:hover::before {
        transform: translateY(-50%);
      }

      .yun-timeline-row:hover .yun-timeline-row-title-text {
        transform: none;
      }
    }
  }
}
</style>
