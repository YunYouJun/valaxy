<script setup lang="ts">
import { onMounted, ref } from 'vue'

const playAnim = ref(false)
onMounted(() => {
  playAnim.value = true
})
</script>

<template>
  <div
    class="yun-ae-frame"
    :class="{
      play: playAnim,
    }"
  >
    <div class="tl absolute" />
    <div class="tr absolute" />
    <div class="bl absolute" />
    <div class="br absolute" />
  </div>
</template>

<style lang="scss">
@use 'sass:map';
@use 'valaxy/client/styles/mixins/index.scss' as *;
@use 'valaxy-theme-yun/styles/vars.scss' as *;

@include screen('md') {
  .yun-ae-frame {
    --corner-size: 50px;
    --corner-margin: 30px;
    --corner-border-size: 5px;
  }
}

.yun-ae-frame {
  --corner-size: 40px;
  --corner-margin: 10px;
  --corner-border-size: 3px;

  div {
    width: var(--corner-size);
    height: var(--corner-size);

    &::before, &::after {
      content: '';
      display: block;
      position: absolute;
      background-color: var(--va-c-text);
    }

    &::before {
      width: 100%;
      height: var(--corner-border-size);
    }

    &::after {
      width: var(--corner-border-size);
      height: 100%;
    }

    &:nth-child(1) {
      top: var(--corner-margin);
      left: var(--corner-margin);
    }

    &:nth-child(2) {
      top: var(--corner-margin);
      right: var(--corner-margin);

      &::after {
        top: 0;
        right: 0;
      }
    }

    &:nth-child(3) {
      bottom: var(--corner-margin);
      left: var(--corner-margin);

      &::before {
        bottom: 0;
        left: 0;
      }
    }

    &:nth-child(4) {
      bottom: var(--corner-margin);
      right: var(--corner-margin);

      &::before, &::after {
        bottom: 0;
        right: 0;
      }
    }
  }

  .tl, .tr, .bl, .br {
    position: absolute;
    transition: transform 0.6s map.get($cubic-bezier, 'ease-in');
  }

  .tl {
    transform: translate(calc(var(--corner-margin) * -1), calc(var(--corner-margin) * -1));
  }

  .tr {
    transform: translate(calc(var(--corner-margin)), calc(var(--corner-margin) * -1));
  }

  .bl {
    transform: translate(calc(var(--corner-margin) * -1), calc(var(--corner-margin)));
  }

  .br {
    transform: translate(calc(var(--corner-margin)), calc(var(--corner-margin)));
  }

  &.play {
    .tl {
      transform: translate(0, 0);
    }

    .tr {
      transform: translate(0, 0);
    }

    .bl {
      transform: translate(0, 0);
    }

    .br {
      transform: translate(0, 0);
    }
  }
}
</style>
