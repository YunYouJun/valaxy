<script setup lang="ts">
import type { MotionVariants } from '@vueuse/motion'
import type { Post } from 'valaxy'
import { formatDate, useValaxyI18n } from 'valaxy'
import { ref } from 'vue'

const props = defineProps<{
  i: number
  post: Post
}>()

const show = ref(false)

const motionVariants: MotionVariants<never> = {
  initial: { opacity: 0, y: 20 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 200,
      delay: props.i * 50,
      onComplete() {
        show.value = true
      },
    },
  },
}

const { $tO } = useValaxyI18n()
</script>

<template>
  <article
    v-motion="motionVariants"
    class="post-item relative"
    :class="{ show }"
  >
    <header
      class="post-header cursor-pointer w-full"
      flex="~"
      items-center
      relative
      :class="{ show }"
    >
      <div class="post-meta">
        <time v-if="post.date" class="post-time" font="mono" opacity="80">{{
          formatDate(post.date, {
            template: 'MM-DD',
          }) }}
        </time>
      </div>
      <h2 class="post-title w-full" inline-flex items-center font="serif bold">
        <RouterLink :to="post.path || ''" class="post-title-link">
          <span v-if="post._collection" i-ri-book-2-line class="mr-1 op-60" />
          {{ $tO(post.title) }}
        </RouterLink>
      </h2>
    </header>
  </article>
</template>

<style lang="scss">
.post-collapse {
  .post-header {
    border-radius: 0.375rem;
    transition: background-color 180ms ease;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: 10px;
      height: 10px;
      margin-left: -4px;
      border-radius: 50%;
      border: 1px solid var(--va-c-link);
      background-color: var(--va-c-bg-light);
      z-index: 1;
      transition: background var(--va-transition-duration);
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 1px;
      background-color: color-mix(in srgb, var(--va-c-link) 28%, transparent);
      transition: width 800ms var(--yun-ease-in);
    }

    &.show {
      &::after {
        width: 100%;
      }
    }

    &:hover {
      background-color: color-mix(in srgb, var(--va-c-text) 4%, transparent);

      &::before {
        background: var(--va-c-link);
      }
    }

    .post-title {
      margin-left: 0.1rem;
      padding: 0;
      font-size: 1rem;

      .post-title-link {
        .icon {
          width: 1.1rem;
          height: 1.1rem;
          margin-right: 0.3rem;
        }
      }
    }

    .post-meta {
      font-size: 1rem;
      margin: 1rem 0 1rem 1.2rem;
      white-space: nowrap;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;

      &::before,
      &::after {
        transition: none;
      }
    }
  }

  .post-item {
    &::before {
      content: '';
      position: absolute;
      width: 2px;
      height: 0;
      background: color-mix(in srgb, var(--va-c-link) 28%, transparent);
      transition: height 600ms var(--yun-ease-in);

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }

    &.show {
      &::before {
        height: 100%;
      }
    }
  }
}
</style>
