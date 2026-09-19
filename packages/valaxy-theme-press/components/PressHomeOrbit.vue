<script setup lang="ts">
import type { ThemeableImage } from '../types'
import { useElementVisibility } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(defineProps<{
  /** The site's own logo, including light and dark variants. */
  image: ThemeableImage
  /** Allow ambient motion; reduced-motion preferences always take priority. */
  animated?: boolean
}>(), { animated: true })

const { t } = useI18n()
const scene = useTemplateRef<HTMLElement>('scene')
const isVisible = useElementVisibility(scene)
const paused = shallowRef(false)
const playing = computed(() => props.animated && isVisible.value && !paused.value)
</script>

<template>
  <div ref="scene" class="press-home-orbit" :class="{ 'is-playing': playing }">
    <div class="orbit-grid" aria-hidden="true" />
    <div class="orbit-glow" aria-hidden="true" />
    <div class="orbit-system" aria-hidden="true">
      <div class="orbit-plane plane-one">
        <div class="orbit-ring">
          <span class="orbit-satellite" />
        </div>
      </div>
      <div class="orbit-plane plane-two">
        <div class="orbit-ring">
          <span class="orbit-satellite" />
        </div>
      </div>
      <div class="orbit-plane plane-three">
        <div class="orbit-ring">
          <span class="orbit-satellite" />
        </div>
      </div>
    </div>
    <div class="orbit-logo">
      <PressImage :image="image" />
    </div>
    <div class="orbit-stars" aria-hidden="true">
      <span v-for="star in 6" :key="star" class="orbit-star" />
    </div>
    <button
      v-if="animated"
      class="orbit-toggle"
      type="button"
      :aria-label="t('home.pauseAnimation')"
      :aria-pressed="paused"
      :title="t(paused ? 'home.resumeAnimation' : 'home.pauseAnimation')"
      @click="paused = !paused"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path v-if="paused" d="M5 3 13 8 5 13Z" />
        <path v-else d="M4 3h3v10H4zm5 0h3v10H9z" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.press-home-orbit {
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;
  width: 100%;
  height: 100%;
  min-height: 300px;
  overflow: hidden;
}

.orbit-grid,
.orbit-glow,
.orbit-stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.orbit-grid {
  background-image: linear-gradient(var(--pr-c-divider-light) 1px, transparent 1px),
    linear-gradient(90deg, var(--pr-c-divider-light) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse, #000 10%, transparent 72%);
  opacity: 0.55;
}

.orbit-glow {
  background: radial-gradient(ellipse at 50% 52%, var(--pr-c-orbit-glow), transparent 64%);
}

.orbit-system {
  position: absolute;
  width: min(88%, 460px);
  aspect-ratio: 1;
}

.orbit-plane {
  position: absolute;
  inset: 0;
  transform: rotate(-28deg) scaleY(0.52);
}

.plane-two {
  inset: 5%;
  transform: rotate(46deg) scaleY(0.64);
}

.plane-three {
  inset: -10%;
  transform: rotate(-14deg) scaleY(0.86);
  opacity: 0.45;
}

.orbit-ring {
  position: absolute;
  inset: 0;
  border: 1px solid var(--pr-c-orbit-line);
  border-radius: 50%;
  animation: press-orbit-turn 28s linear infinite;
  animation-play-state: paused;
}

.plane-two .orbit-ring {
  animation-duration: 36s;
  animation-direction: reverse;
}

.plane-three .orbit-ring {
  animation-duration: 48s;
}

.orbit-satellite {
  position: absolute;
  top: 50%;
  left: -4px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--pr-c-brand);
  box-shadow: 0 0 14px var(--pr-c-brand);
}

.plane-two .orbit-satellite {
  background: var(--pr-c-accent);
  box-shadow: 0 0 14px var(--pr-c-accent);
}

.orbit-logo {
  z-index: 1;
  width: 48%;
  max-width: 260px;
  animation: press-orbit-float 7s ease-in-out infinite;
  animation-play-state: paused;
}

.orbit-logo :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  max-height: 280px;
  object-fit: contain;
  filter: drop-shadow(0 16px 28px var(--pr-c-orbit-glow));
}

.orbit-star {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--pr-c-brand);
  opacity: 0.5;
}

.orbit-star:nth-child(1) {
  top: 22%;
  left: 22%;
}

.orbit-star:nth-child(2) {
  top: 28%;
  left: 78%;
}

.orbit-star:nth-child(3) {
  top: 73%;
  left: 20%;
}

.orbit-star:nth-child(4) {
  top: 78%;
  left: 67%;
}

.orbit-star:nth-child(5) {
  top: 15%;
  left: 58%;
}

.orbit-star:nth-child(6) {
  top: 60%;
  left: 87%;
}

.orbit-toggle {
  position: absolute;
  right: 16px;
  bottom: 16px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 50%;
  color: var(--pr-c-text-2);
  background: var(--pr-c-bg);
  cursor: pointer;
}

.orbit-toggle:hover {
  color: var(--pr-c-brand);
  border-color: currentcolor;
}

.is-playing .orbit-ring,
.is-playing .orbit-logo {
  animation-play-state: running;
}

@keyframes press-orbit-turn {
  to { transform: rotate(360deg); }
}

@keyframes press-orbit-float {
  0%, 100% { transform: translateY(5px); }
  50% { transform: translateY(-9px); }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-ring,
  .orbit-logo {
    animation: none;
  }

  .orbit-toggle {
    display: none;
  }
}
</style>
