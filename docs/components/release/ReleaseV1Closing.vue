<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { ref } from 'vue'
import { releaseIsPreview, releaseVersion } from '../../data/release-v1'

defineProps<{ copy: ReleaseCopy['closing'], prefix: string }>()
const command = 'pnpm create valaxy'
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
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
  padding-block: 100px 90px;
  text-align: center;
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
