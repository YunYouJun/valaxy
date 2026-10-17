<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { useElementVisibility } from '@vueuse/core'
import { ref, useTemplateRef } from 'vue'
import { releaseIsPreview, releaseVersion } from '../../data/release-v1'

defineProps<{ copy: ReleaseCopy['closing'], prefix: string }>()
const command = 'pnpm create valaxy'
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
/**
 * A three-armed spiral of stars behind the closing line (V + Galaxy).
 * Positions are deterministic so SSR and hydration render the same SVG.
 */
const stars = Array.from({ length: 96 }, (_, i) => {
  const t = i / 96
  const jitter = Math.sin(i * 12.9898) * 43758.5453 % 1
  const angle = (i % 3) * (Math.PI * 2 / 3) + t * Math.PI * 2.6 + jitter * 0.35
  const radius = 30 + t * 270 + jitter * 18
  return {
    x: +(Math.cos(angle) * radius).toFixed(1),
    y: +(Math.sin(angle) * radius).toFixed(1),
    r: +(0.8 + Math.abs(jitter) * 1.8 * (1 - t * 0.5)).toFixed(2),
    o: +(0.35 + (1 - t) * 0.55).toFixed(2),
  }
})
const galaxy = useTemplateRef<SVGElement>('galaxy')
const galaxyVisible = useElementVisibility(galaxy)

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(command)
    copyState.value = 'copied'
  }
  catch {
    copyState.value = 'failed'
  }
}
</script>

<template>
  <section class="closing-section" aria-labelledby="closing-title">
    <svg
      ref="galaxy"
      class="closing-galaxy"
      :class="{ 'is-playing': galaxyVisible }"
      viewBox="-320 -160 640 320"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="closing-galaxy-core">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.85" />
          <stop offset="0.3" stop-color="#9fd3ff" stop-opacity="0.45" />
          <stop offset="1" stop-color="#123c9c" stop-opacity="0" />
        </radialGradient>
      </defs>
      <!-- Flatten the spinning disk so it reads as a galaxy seen at an angle. -->
      <g transform="scale(1 0.42)">
        <g class="galaxy-spin">
          <circle r="48" fill="url(#closing-galaxy-core)" />
          <!-- Zero-length round strokes stay circular however the disk is flattened. -->
          <path
            v-for="(star, index) in stars"
            :key="index"
            class="galaxy-star"
            :d="`M${star.x} ${star.y}h0`"
            :stroke-width="star.r * 2"
            :opacity="star.o"
          />
        </g>
      </g>
    </svg>
    <h2 id="closing-title" class="release-heading">
      <span>{{ copy.title[0] }}</span><span>{{ copy.title[1] }}</span>
    </h2>
    <p class="release-description">
      {{ copy.description }}
    </p>
    <div class="closing-command">
      <span aria-hidden="true">$</span><code>{{ command }}</code><button :aria-label="copy.copy" @click="copyCommand">
        {{ copyState === 'copied' ? '✓' : '⧉' }}
      </button>
    </div>
    <p class="copy-feedback" aria-live="polite">
      {{ copyState === 'copied' ? copy.copied : copyState === 'failed' ? copy.failed : '' }}
    </p>
    <RouterLink class="release-button" :to="`${prefix}/guide/getting-started`">
      {{ copy.action }}
    </RouterLink>
    <p class="release-status">
      <span>{{ releaseIsPreview ? copy.preview : copy.stable }}</span>
      <span :aria-label="copy.status">{{ releaseVersion }}</span>
      <span>Node.js ≥ 22.12.0</span>
    </p>
  </section>
</template>

<style scoped>
/* The page closes on the same night plate it opened with. */
.closing-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 120px 24px 110px;
  color: #fff;
  background: var(--release-plate);
  text-align: center;
}

.closing-section .release-description {
  color: rgb(255 255 255 / 0.72);
}

.closing-section .release-button {
  color: #0a1a4f;
  background: #eef3ff;
}

.closing-section .release-button:hover {
  background: #fff;
}

.closing-galaxy {
  position: absolute;
  top: 150px;
  left: 50%;
  z-index: -1;
  width: min(1040px, 140%);
  translate: -50% 0;
  color: rgb(255 255 255 / 0.9);
  fill: currentcolor;
  pointer-events: none;
  mask-image: radial-gradient(closest-side, #000 55%, transparent);
}

.galaxy-star {
  fill: none;
  stroke: currentcolor;
  stroke-linecap: round;
  vector-effect: non-scaling-stroke;
}

/* The galaxy is centered on the user-space origin. */
.galaxy-spin {
  transform-origin: 0 0;
}

/* Slow enough to read as ambient; it only turns while on screen. */
@media (prefers-reduced-motion: no-preference) {
  .galaxy-spin {
    animation: closing-galaxy-spin 140s linear infinite paused;
  }

  .is-playing .galaxy-spin {
    animation-play-state: running;
  }
}

@keyframes closing-galaxy-spin {
  to { rotate: 360deg; }
}

.closing-section .release-heading {
  font-size: clamp(44px, 5.4vw, 76px);
}

.closing-section .release-description {
  margin-top: 20px;
}

.closing-command {
  margin: 38px auto 0;
  max-width: 440px;
  border: 1px solid rgb(255 255 255 / 0.22);
  border-radius: 4px;
  background: rgb(4 12 40 / 0.5);
  color: #fff;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.closing-command > span {
  color: #9fd3ff;
}

.closing-command code {
  font-family: "Maple Mono", ui-monospace, monospace;
  font-size: 15px;
  user-select: all;
}

.closing-command button {
  color: rgb(255 255 255 / 0.72);
  font-size: 23px;
  margin-left: auto;
  min-width: 40px;
  min-height: 40px;
}

.copy-feedback {
  font-size: 13px;
  color: #9fd3ff;
  min-height: 30px;
  margin-top: 8px;
}

.release-status {
  color: rgb(255 255 255 / 0.6);
  font-size: 13px;
  line-height: 1.9;
  margin-top: 25px;
}

.release-status span {
  display: block;
}

@media (width <= 600px) {
  .closing-section {
    padding-block: 80px 60px;
  }

  .closing-command code {
    font-size: 13px;
  }

  .closing-command {
    padding: 12px 15px;
  }
}
</style>
