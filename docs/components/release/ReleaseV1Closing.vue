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
  <section class="closing-section release-width release-reveal" aria-labelledby="closing-title">
    <svg
      ref="galaxy"
      class="closing-galaxy"
      :class="{ 'is-playing': galaxyVisible }"
      viewBox="-320 -160 640 320"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="closing-galaxy-core">
          <stop offset="0" stop-color="#ede9fe" stop-opacity="0.8" />
          <stop offset="0.3" stop-color="#a78bfa" stop-opacity="0.45" />
          <stop offset="1" stop-color="#7c3aed" stop-opacity="0" />
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
      <span>{{ copy.title[0] }}</span><span class="release-gradient">{{ copy.title[1] }}</span>
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
      {{ releaseIsPreview ? copy.preview : copy.stable }} · <span :aria-label="copy.status">{{ releaseVersion }}</span><br>Node.js ≥22.12.0
    </p>
  </section>
</template>

<style scoped>
.closing-section {
  position: relative;
  isolation: isolate;
  padding-block: 100px 90px;
  text-align: center;
}

.closing-galaxy {
  position: absolute;
  top: 150px;
  left: 50%;
  z-index: -1;
  width: min(1040px, 140%);
  translate: -50% 0;
  color: var(--release-accent);
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

.dark .closing-galaxy {
  color: #c4b5fd;
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
  border-radius: 12px;
  background: #24262b;
  color: white;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 28px #1d1d1f12;
}

.closing-command > span {
  color: #7ac3b3;
}

.closing-command code {
  font-size: 15px;
  user-select: all;
}

.closing-command button {
  color: #c7c7cf;
  font-size: 23px;
  margin-left: auto;
  min-width: 40px;
  min-height: 40px;
}

.copy-feedback {
  font-size: 12px;
  color: var(--release-muted);
  min-height: 30px;
  margin-top: 8px;
}

.release-status {
  color: var(--release-muted);
  font-size: 12px;
  line-height: 1.9;
  margin-top: 25px;
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
