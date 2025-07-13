<script setup lang="ts">
import type { Post } from 'valaxy'
import { useMotion } from '@vueuse/motion'
import { formatDate, useValaxyI18n } from 'valaxy'
import { ref } from 'vue'

const props = defineProps<{
  i: number
  post: Post
}>()

const show = ref(false)

const itemRef = ref<HTMLElement>()
useMotion(itemRef, {
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
})

const { $tO } = useValaxyI18n()
</script>

<template>
  <article
    ref="itemRef"
    class="post-item relative"
    :class="{ show }"
  >
    <header
      class="post-header cursor-pointer w-full" flex="~" items-center relative
      hover="bg-black/1"
      :class="{ show }"
    >
      <div class="post-meta">
        <time v-if="post.date" class="post-time" font="mono" opacity="80">{{
          formatDate(post.date, {
            template: 'MM-DD',
          }) }}
        </time>
      </div>
      <h2 class="post-title w-full" inline-flex items-center font="serif black">
        <RouterLink :to="post.path || ''" class="post-title-link">
          {{ $tO(post.title) }}
        </RouterLink>
      </h2>
    </header>
  </article>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

.post-collapse {
  .post-header {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: 10px;
      height: 10px;
      margin-left: -4px;
      border-radius: 50%;
      border: 1px solid var(--va-c-primary);
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
      background-color: rgba(var(--va-c-primary-rgb), 0.3);
      transition: width 800ms map.get($cubic-bezier, 'ease-in');
    }

    &.show {
      &::after {
        width: 100%;
      }
    }

    &:hover {
      &::before {
        background: var(--va-c-primary);
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
  }

  .post-item {
    &::before {
      content: '';
      position: absolute;
      width: 2px;
      height: 0;
      background: rgba(var(--va-c-primary-rgb), 0.3);
      transition: height 600ms map.get($cubic-bezier, 'ease-in');
    }

    &.show {
      &::before {
        height: 100%;
      }
    }
  }
}
</style>
