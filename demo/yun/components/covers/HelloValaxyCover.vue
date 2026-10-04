<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useId, useTemplateRef } from 'vue'

withDefaults(defineProps<{
  context?: 'card' | 'page' | 'body'
  subtitle?: string
}>(), {
  context: 'body',
  subtitle: 'Your words, a new constellation.',
})

const id = useId()
const root = shallowRef<HTMLElement>()
const svg = useTemplateRef<SVGSVGElement>('svg')
defineExpose({ svg })
const illuminated = shallowRef(false)
const inView = shallowRef(false)
const pageVisible = shallowRef(true)
// Fixed coordinates keep the server render and the first client render identical.
const stars = Array.from({ length: 36 }, (_, i) => ({
  x: (i * 137 + 41) % 960,
  y: (i * 73 + 29) % 410,
  r: i % 4 === 0 ? 2 : 1,
}))
const constellation = [[530, 110], [570, 165], [615, 228], [660, 290], [707, 215], [754, 150], [794, 88]]
let observer: IntersectionObserver | undefined
function updateVisibility() {
  pageVisible.value = document.visibilityState !== 'hidden'
}
onMounted(() => {
  updateVisibility()
  document.addEventListener('visibilitychange', updateVisibility)
  if (typeof IntersectionObserver !== 'undefined') {
    observer = new IntersectionObserver(([entry]) => {
      inView.value = entry.isIntersecting
    })
    if (root.value)
      observer.observe(root.value)
  }
  else {
    inView.value = true
  }
})
onUnmounted(() => {
  observer?.disconnect()
  document.removeEventListener('visibilitychange', updateVisibility)
})
</script>

<template>
  <div
    ref="root" class="hello-valaxy-cover" :data-context="context"
    :class="{ illuminated, playing: illuminated && inView && pageVisible, compact: context === 'card' }"
  >
    <svg ref="svg" class="hello-valaxy-sky" viewBox="0 0 960 540" preserveAspectRatio="xMinYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient :id="`${id}-sky`" x2="0.8" y2="1">
          <stop stop-color="#102751" />
          <stop offset="0.65" stop-color="#225d93" />
          <stop offset="1" stop-color="#7cc9da" />
        </linearGradient>
        <radialGradient :id="`${id}-halo`">
          <stop stop-color="#95e5ed" stop-opacity="0.3" />
          <stop offset="1" stop-color="#95e5ed" stop-opacity="0" />
        </radialGradient>
        <linearGradient :id="`${id}-caption`">
          <stop stop-color="#091b3b" stop-opacity="0.65" />
          <stop offset="0.8" stop-color="#091b3b" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path d="M0 0H960V540H0Z" :fill="`url(#${id}-sky)`" />
      <circle cx="670" cy="210" r="250" :fill="`url(#${id}-halo)`" />
      <g fill="#daefff" opacity="0.6">
        <circle v-for="(star, i) in stars" :key="i" :cx="star.x" :cy="star.y" :r="star.r" />
      </g>
      <g class="hello-valaxy-orbits" fill="none" stroke="#b8e5f3">
        <circle cx="660" cy="208" r="158" opacity="0.2" />
        <ellipse cx="660" cy="208" rx="212" ry="66" transform="rotate(-28 660 208)" opacity="0.25" />
        <g class="hello-valaxy-orbit hello-valaxy-motion">
          <circle cx="818" cy="208" r="5" fill="#b5f1ee" stroke="none" />
          <circle cx="818" cy="208" r="11" opacity="0.3" />
        </g>
      </g>
      <g fill="none" stroke="#c4f6ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M530 110 570 165 615 228 660 290 707 215 754 150 794 88" opacity="0.18" />
        <path class="hello-valaxy-constellation" d="M530 110 570 165 615 228 660 290 707 215 754 150 794 88" pathLength="1" />
      </g>
      <g class="hello-valaxy-stars" fill="#e0fcff">
        <g v-for="([x, y], i) in constellation" :key="i">
          <circle class="hello-valaxy-glow" :cx="x" :cy="y" r="12" />
          <path :d="`M${x - 6} ${y}h12M${x} ${y - 6}v12`" stroke="currentColor" />
          <circle :cx="x" :cy="y" r="3" />
        </g>
      </g>
      <g class="hello-valaxy-clouds hello-valaxy-motion">
        <path d="M-40 460Q30 366 110 420Q148 340 242 408Q304 369 374 433Q440 347 528 408Q605 350 690 425Q790 335 886 410Q954 385 1000 443V570H-40Z" fill="#6faecb" opacity="0.35" />
        <path d="M-40 494Q60 416 148 474Q223 403 326 473Q405 428 473 487Q565 391 660 466Q748 412 835 474Q920 404 1000 478V570H-40Z" fill="#b4e4e9" opacity="0.4" />
      </g>
      <path d="M0 0H960V540H0Z" :fill="`url(#${id}-caption)`" />
      <g fill="#f4fbff">
        <text x="60" y="342" :style="{ fontFamily: 'Georgia, serif', fontSize: context === 'card' ? '74px' : '64px', fontWeight: 800 }">Hello, Valaxy!</text>
        <text x="60" y="388" :style="{ fontFamily: 'sans-serif', fontSize: context === 'card' ? '28px' : '22px' }">{{ subtitle }}</text>
      </g>
    </svg>
    <div class="hello-valaxy-caption">
      <span class="hello-valaxy-description">Hello, Valaxy! {{ subtitle }}</span>
      <button type="button" :aria-pressed="illuminated" @click="illuminated = !illuminated">
        {{ illuminated ? 'Stars are shining' : 'Light up the stars' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.hello-valaxy-cover {
  position: relative;
  isolation: isolate;
  width: 100%;
  height: auto;
  min-height: 12rem;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  color: #f4fbff;
  background: #102751;
  border-radius: inherit;
}

.hello-valaxy-cover[data-context="card"],
.hello-valaxy-cover[data-context="page"] {
  height: 100%;
}

.hello-valaxy-sky {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hello-valaxy-caption {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  padding: clamp(1rem, 4vw, 2.5rem);
  pointer-events: none;
}

.hello-valaxy-description {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}

.hello-valaxy-caption button {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgb(220 245 255 / 0.65);
  border-radius: 2rem;
  color: inherit;
  background: #153c64;
  font: inherit;
  font-size: 0.8rem;
  cursor: pointer;
  pointer-events: auto;
}

.hello-valaxy-caption button:focus-visible {
  outline: 2px solid #c4f6ff;
  outline-offset: 4px;
}

.hello-valaxy-constellation {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 900ms ease;
}

.illuminated .hello-valaxy-constellation {
  stroke-dashoffset: 0;
}

.hello-valaxy-glow {
  opacity: 0;
  transition: opacity 600ms ease;
}

.illuminated .hello-valaxy-glow {
  opacity: 0.2;
}

.hello-valaxy-orbit {
  transform-origin: 660px 208px;
  animation: hello-valaxy-orbit 24s linear infinite;
}

.hello-valaxy-clouds {
  animation: hello-valaxy-drift 12s ease-in-out infinite alternate;
}

.hello-valaxy-motion {
  animation-play-state: paused;
}

.playing .hello-valaxy-motion {
  animation-play-state: running;
}

.compact .hello-valaxy-caption {
  padding: 1rem;
}

@keyframes hello-valaxy-orbit {
  to { transform: rotate(360deg); }
}

@keyframes hello-valaxy-drift {
  to { transform: translate(18px, -8px); }
}

@media (prefers-reduced-motion: reduce) {
  .hello-valaxy-motion {
    animation: none;
  }

  .hello-valaxy-constellation,
  .hello-valaxy-glow {
    transition: none;
  }
}
</style>
