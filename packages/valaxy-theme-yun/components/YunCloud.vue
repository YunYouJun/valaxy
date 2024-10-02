<template>
  <div class="yun-cloud">
    <svg class="waves" viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
      <defs>
        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" fill="var(--yun-c-cloud)" />
      </defs>
      <g class="parallax">
        <use xlink:href="#gentle-wave" x="48" y="0" />
        <use xlink:href="#gentle-wave" x="48" y="3" />
        <use xlink:href="#gentle-wave" x="48" y="5" />
        <use xlink:href="#gentle-wave" x="48" y="7" />
      </g>
    </svg>
  </div>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.dark .yun-cloud {
  --yun-c-cloud: var(--va-c-bg-soft);
}

.yun-cloud {
  display: flex;
  width: 100%;
  z-index: var(--yun-z-cloud);
  box-sizing: border-box;

  .waves {
    display: flex;
    position: relative;
    width: 100%;
    height: 40px;
  }

  .parallax {
    > use {
      animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
    }

    > use:nth-child(1) {
      opacity: 0.7;
      animation-delay: -2s;
      animation-duration: 7s;
    }

    > use:nth-child(2) {
      opacity: 0.5;
      animation-delay: -3s;
      animation-duration: 10s;
    }

    > use:nth-child(3) {
      opacity: 0.3;
      animation-delay: -4s;
      animation-duration: 13s;
    }

    > use:nth-child(4) {
      animation-delay: -5s;
      animation-duration: 20s;
    }
  }
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}
</style>
