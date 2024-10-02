<script lang="ts" setup>
import { gsap } from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)

function goDown() {
  const banner = document.getElementById('yun-banner')
  if (banner) {
    // nav menu height
    const offset = 50

    gsap.to(window, {
      duration: 1,
      scrollTo: {
        y: banner.clientHeight - offset,
      },
      ease: 'power3.inOut',
    })
  }
}
</script>

<template>
  <button
    class="go-down w-20" aria-label="go-down"
    @click="goDown"
  >
    <div i-ri-arrow-down-s-fill inline-flex />
  </button>
</template>

<style lang="scss">
.go-down {
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 8px;
  z-index: var(--yun-z-go-down);
  animation: float 2s ease-in-out infinite;
  font-size: 2.5rem;
  color: var(--va-c-text);
  transition: color var(--va-transition-duration);

  &:hover {
    color: rgba(var(--va-c-primary-rgb), 0.6);
  }
}

@keyframes float {
  0% {
    opacity: 1;
    transform: translateY(0);
  }

  50% {
    opacity: 0.8;
    transform: translateY(-0.8rem);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
