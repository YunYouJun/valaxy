<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { computed, ref } from 'vue'

const props = defineProps<{ copy: ReleaseCopy['themes'], prefix: string }>()
const selected = ref<'yun' | 'press'>('yun')
const demoLink = computed(() => selected.value === 'yun' ? 'https://yun.valaxy.site/' : `${props.prefix}/guide/getting-started`)
</script>

<template>
  <section class="release-width theme-section release-reveal" aria-labelledby="themes-title">
    <div class="theme-intro">
      <h2 id="themes-title" class="release-heading">
        <span v-for="line in copy.title" :key="line">{{ line }}</span>
      </h2>
      <div>
        <p class="release-description">
          {{ copy.description }}
        </p><RouterLink class="release-text-link" :to="`${prefix}/themes/`">
          {{ copy.more }} ›
        </RouterLink>
      </div>
    </div>
    <div class="theme-window">
      <div class="theme-toolbar">
        <div class="release-switch" role="group" :aria-label="copy.caption">
          <button :aria-pressed="selected === 'yun'" @click="selected = 'yun'">
            Yun
          </button>
          <button :aria-pressed="selected === 'press'" @click="selected = 'press'">
            Press
          </button>
        </div>
        <a :href="demoLink" class="release-text-link" target="_blank" rel="noreferrer">{{ copy.live }} ↗</a>
      </div>
      <img :src="`/release/${selected}-preview.webp`" :alt="selected === 'yun' ? copy.altYun : copy.altPress" width="1440" height="900" loading="lazy" decoding="async">
    </div>
    <div class="theme-caption" aria-live="polite">
      <span>{{ selected === 'yun' ? copy.yun : copy.press }}</span><span>{{ copy.caption }}</span>
    </div>
  </section>
</template>

<style scoped>
.theme-section {
  padding-block: 40px 120px;
}

.theme-intro {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: 90px;
  margin-bottom: 50px;
}

.theme-intro .release-description {
  margin-top: 0;
}

.theme-intro .release-text-link {
  display: inline-block;
  margin-top: 20px;
}

.theme-window {
  border: 1px solid var(--release-border);
  border-radius: 16px;
  background: var(--release-surface);
  overflow: hidden;
  box-shadow: 0 24px 60px #1d1d1f08;
}

.theme-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--release-border);
}

.theme-toolbar a {
  font-size: 13px;
}

.theme-window img {
  width: 100%;
  aspect-ratio: 1440 / 900;
  object-fit: cover;
  object-position: top;
  display: block;
}

.theme-caption {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  color: var(--release-muted);
  font-size: 12px;
  margin-top: 22px;
}

@media (width <= 700px) {
  .theme-intro {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .theme-caption {
    flex-direction: column;
    gap: 8px;
  }

  .theme-toolbar {
    padding: 12px;
  }

  .theme-toolbar a {
    font-size: 11px;
  }

  .theme-section {
    padding-bottom: 80px;
  }
}
</style>
