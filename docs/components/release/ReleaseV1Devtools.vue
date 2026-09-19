<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'

defineProps<{
  /** Localized DevTools feature copy and preview. */
  copy: ReleaseCopy['devtools']
  /** Locale prefix for documentation links. */
  prefix: string
}>()

const featureIcons = ['i-ri-article-line', 'i-ri-equalizer-line', 'i-ri-bug-line']
</script>

<template>
  <section id="devtools" class="devtools-section release-width" aria-labelledby="devtools-title">
    <div class="devtools-intro release-reveal">
      <p class="devtools-eyebrow">
        Valaxy DevTools
      </p>
      <h2 id="devtools-title" class="release-heading">
        <span v-for="(line, index) in copy.title" :key="line" :class="{ 'release-gradient': index === 1 }">{{ line }}</span>
      </h2>
      <p class="release-description">
        {{ copy.description }}
      </p>
      <RouterLink class="release-text-link devtools-link" :to="`${prefix}/guide/config/extend#devtools`">
        {{ copy.link }} ›
      </RouterLink>
    </div>
    <figure class="devtools-preview release-reveal">
      <div class="devtools-stage">
        <div class="devtools-window">
          <div class="devtools-toolbar" aria-hidden="true">
            <span class="devtools-window-dots"><i /><i /><i /></span>
            <span>Valaxy DevTools</span>
            <span class="devtools-local">localhost</span>
          </div>
          <img class="devtools-image-light" :src="copy.image" :alt="copy.alt" width="1320" height="650" loading="lazy" decoding="async">
          <img class="devtools-image-dark" :src="copy.darkImage" :alt="copy.alt" width="1320" height="650" loading="lazy" decoding="async">
        </div>
      </div>
      <figcaption class="devtools-caption">
        {{ copy.preview }}
      </figcaption>
    </figure>
    <div class="devtools-features release-reveal">
      <article v-for="(feature, index) in copy.features" :key="feature.title" class="devtools-feature">
        <span class="devtools-feature-icon" :class="featureIcons[index]" aria-hidden="true" />
        <h3 class="devtools-feature-title">
          {{ feature.title }}
        </h3>
        <p class="devtools-feature-description">
          {{ feature.text }}
        </p>
      </article>
    </div>
    <p class="devtools-note">
      {{ copy.note }}
    </p>
  </section>
</template>

<style scoped>
.devtools-section {
  padding-block: 120px 80px;
}

.devtools-intro {
  max-width: 660px;
  margin-inline: auto;
  text-align: center;
}

.devtools-eyebrow {
  margin-bottom: 22px;
  color: var(--release-muted);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.devtools-link {
  display: inline-block;
  margin-top: 24px;
}

.devtools-preview {
  margin: 56px 0 0;
}

.devtools-stage {
  padding: 44px 44px 0;
  overflow: hidden;
  border-radius: 24px;
  background: var(--release-art-gradient);
}

.devtools-window {
  overflow: hidden;
  border: 1px solid var(--release-border);
  border-bottom: 0;
  border-radius: 12px 12px 0 0;
  background: var(--release-surface);
  box-shadow: 0 16px 60px #1d1d1f1a;
}

.devtools-toolbar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--release-border);
  color: var(--release-muted);
  font-size: 11px;
}

.devtools-window-dots {
  display: flex;
  gap: 6px;
}

.devtools-window-dots i {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--release-border);
}

.devtools-local {
  text-align: right;
}

.devtools-window img {
  display: block;
  width: 100%;
  height: auto;
}

.devtools-window .devtools-image-dark {
  display: none;
}

:global(.dark .devtools-window .devtools-image-light) {
  display: none;
}

:global(.dark .devtools-window .devtools-image-dark) {
  display: block;
}

.devtools-caption {
  margin-top: 20px;
  color: var(--release-muted);
  font-size: 12px;
  text-align: center;
}

.devtools-features {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 48px;
  margin-top: 56px;
}

.devtools-feature-icon {
  display: block;
  margin-bottom: 18px;
  color: var(--release-link);
  font-size: 26px;
}

.devtools-feature-title {
  font-size: 21px;
  font-weight: 600;
  letter-spacing: -0.03em;
}

.devtools-feature-description {
  margin-top: 14px;
  color: var(--release-muted);
  font-size: 14px;
  line-height: 1.9;
}

.devtools-note {
  margin-top: 52px;
  color: var(--release-muted);
  font-size: 12px;
  line-height: 1.8;
  text-align: center;
}

@media (width <= 700px) {
  .devtools-section {
    padding-block: 80px 60px;
  }

  .devtools-stage {
    padding: 20px 16px 0;
    border-radius: 16px;
  }

  .devtools-toolbar {
    padding: 10px;
    font-size: 10px;
  }

  .devtools-local {
    visibility: hidden;
  }

  .devtools-features {
    grid-template-columns: 1fr;
    gap: 28px;
    margin-top: 40px;
  }

  .devtools-feature + .devtools-feature {
    border-top: 1px solid var(--release-border);
    padding-top: 28px;
  }

  .devtools-feature-icon {
    margin-bottom: 12px;
  }
}
</style>
