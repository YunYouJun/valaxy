<script lang="ts" setup>
import { usePrevNext } from '~/composables'
const [prev, next] = usePrevNext()
</script>

<template>
  <div class="post-nav">
    <div class="post-nav-item">
      <router-link v-if="prev" class="post-nav-prev" :to="prev.path" :title="prev.title">
        <div class="icon" i-ri-arrow-left-s-line />
        <span class="title truncate" text="sm">{{ prev.title }}</span>
      </router-link>
    </div>
    <div class="post-nav-item">
      <router-link v-if="next" :to="next.path" :title="next.title" class="post-nav-next">
        <span class="title truncate" text="sm">{{ next.title }}</span>
        <div class="icon" i-ri-arrow-right-s-line />
      </router-link>
    </div>
  </div>
</template>

<style lang="scss">
@use '~/styles/mixins' as *;

.post-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;

  &-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;

    color: var(--yun-c-primary);

    outline: none;
    font-size: 1.5rem;

    font-weight: bold;
    text-transform: uppercase;
    height: 3rem;
    transition: 0.4s;

    &:hover {
      background-color: rgba(var(--yun-c-primary-rgb), 0.1);
      box-shadow: 0 0 15px rgba(black, 0.1);
    }
  }

  &-prev {
    padding: 0 0.6rem 0 0.1rem;
  }

  &-next {
    padding: 0 0.1rem 0 0.6rem;
  }

  &-prev, &-next {
    display: inline-flex;
    align-items: center;

    height: 3rem;

    font-size: 1rem;

    .title {
      overflow: hidden;
      max-width: 10rem;
    }

    .icon {
      width: 1.2rem;
      height: 1.2rem;
    }
  }
}

@include desktop {
  .post-nav {
    &-prev, &-next {
      .title {
        max-width: 18rem;
      }
    }
  }
}
</style>
