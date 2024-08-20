<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

const { t } = useI18n()
</script>

<template>
  <PressButton
    class="overflow-hidden"
    :theme="theme"
    :link="link"
    :text="text"
  >
    <div class="flex justify-center items-center">
      <div class="svg-wrapper">
        <div class="icon" />
      </div>
      <span>
        {{ t(text) }}
      </span>
    </div>
  </PressButton>
</template>

<style lang="scss">
// @see https://freecodez.com/post/h1s1z8j
.sese-btn {
  span {
    display: block;
    margin-left: 0.3em;
    transition: all 0.3s ease-in-out;
  }

  .svg-wrapper {
    position: absolute;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }

  .icon {
    transform-origin: center center;
    transition: all 0.3s ease-in-out;

    // mask
    mask-image: url('/favicon.svg');
    mask-size: 100% 100%;
    background-color: white;
    width: 1.2em;
    height: 1.2em;
    transform: translateX(-1.2em) rotate(0) scale(1);
    opacity: 0;
  }

  &:hover .svg-wrapper {
    animation: fly 0.6s ease-in-out infinite alternate;
  }

  &:hover .icon {
    display: inline-flex;
    transform: translateX(0) rotate(0deg) scale(1.1);
    opacity: 1;
  }

  &:hover span {
    transform: translateX(5.5em);
    opacity: 0;
  }

  &:active {
    transform: scale(0.95);
  }
}

@keyframes fly {
  from {
    transform: translateY(0.1em);
  }

  to {
    transform: translateY(-0.1em);
  }
}
</style>
