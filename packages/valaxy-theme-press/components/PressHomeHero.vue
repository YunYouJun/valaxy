<script lang="ts" setup>
import type { Hero } from '../types'
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'
import { useLocaleConfig } from '../composables'
import PressButton from './PressButton.vue'

const fm = useFrontmatter()
const hero = computed(() => fm.value.hero as Hero | undefined)

const { currentLocale, currentLocaleKey, hasLocales } = useLocaleConfig()

/**
 * Prepend the current locale prefix to internal links.
 */
function resolveLocaleLink(link: string): string {
  if (!hasLocales.value || !link.startsWith('/') || link.startsWith('//') || currentLocaleKey.value === 'root')
    return link
  const prefix = currentLocale.value.link
  const base = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix
  if (link === base || link.startsWith(`${base}/`))
    return link
  return `${base}${link}`
}

const actions = computed(() => {
  return (hero.value?.actions || []).map(action => ({
    ...action,
    link: resolveLocaleLink(action.link),
  }))
})
</script>

<template>
  <section
    v-if="hero"
    class="press-home-hero"
    :class="{
      'is-centered': hero.layout === 'center' || !hero.image,
      'has-image': !!hero.image,
    }"
  >
    <div class="hero-copy">
      <p v-if="hero.eyebrow" class="hero-eyebrow">
        {{ hero.eyebrow }}
      </p>
      <h1 class="hero-heading">
        <span v-if="hero.name" class="hero-name" :class="{ 'is-title': !hero.text }">{{ hero.name }}</span>
        <span v-if="hero.text" class="hero-text">{{ hero.text }}</span>
      </h1>
      <p v-if="hero.tagline" class="hero-tagline">
        {{ hero.tagline }}
      </p>
      <div v-if="actions.length" class="hero-actions">
        <template v-for="action in actions" :key="action.link">
          <PressGetStarted
            v-if="action.type === 'fly'"
            :theme="action.theme"
            :link="action.link"
            :text="action.text"
          />
          <PressButton
            v-else
            :theme="action.theme"
            :link="action.link"
            :text="action.text"
          />
        </template>
      </div>
      <PressHomeCommand v-if="hero.command" :command="hero.command" />
    </div>

    <div v-if="hero.image" class="hero-visual">
      <PressHomeOrbit
        v-if="hero.visual === 'orbit'"
        :image="hero.image"
        :animated="hero.animation !== false"
      />
      <div v-else class="press-hero-image">
        <div class="press-hero-image-bg" aria-hidden="true" />
        <PressImage :image="hero.image" />
      </div>
      <p v-if="hero.imageCaption" class="hero-caption">
        {{ hero.imageCaption }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.press-home-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(0, 1fr);
  border-bottom: 1px solid var(--pr-c-divider-light);
  min-height: 620px;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: clamp(32px, 5vw, 72px);
  min-width: 0;
}

.hero-eyebrow,
.hero-name,
.hero-caption {
  font-family: var(--pr-font-mono);
}

.hero-eyebrow {
  margin: 0 0 24px;
  color: var(--pr-c-text-2);
  font-size: 12px;
  letter-spacing: 0.08em;
}

.hero-heading {
  margin: 0;
  font-family: var(--pr-font-display);
  font-weight: 600;
}

.hero-name {
  display: block;
  margin-bottom: 20px;
  color: var(--pr-c-brand);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.18em;
}

.hero-text,
.hero-name.is-title {
  display: block;
  font-size: clamp(40px, 4.5vw, 68px);
  letter-spacing: -0.045em;
  line-height: 1.12;
  overflow-wrap: anywhere;
  text-wrap: balance;
  white-space: pre-line;
}

.hero-tagline {
  max-width: 34em;
  margin: 28px 0 0;
  color: var(--pr-c-text-2);
  font-size: 17px;
  line-height: 1.8;
  text-wrap: pretty;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

.hero-visual {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 0;
  border-left: 1px solid var(--pr-c-divider-light);
}

.hero-caption {
  position: absolute;
  bottom: 28px;
  margin: 0;
  color: var(--pr-c-text-2);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.press-hero-image {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 360px;
  padding: 48px;
}

.press-hero-image-bg {
  position: absolute;
  inset: 15%;
  background: radial-gradient(ellipse, var(--pr-c-brand-soft), transparent 70%);
}

.press-hero-image :deep(img) {
  position: relative;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 320px;
  object-fit: contain;
}

.is-centered {
  grid-template-columns: minmax(0, 1fr);
  min-height: auto;
}

.is-centered .hero-copy {
  align-items: center;
  padding-block: 72px;
  text-align: center;
}

.is-centered .hero-text {
  max-width: 18ch;
}

.is-centered .hero-actions {
  justify-content: center;
}

.is-centered .hero-visual {
  grid-row: 1;
  border-left: 0;
  height: 400px;
}

.is-centered.has-image .hero-copy {
  padding-top: 32px;
}

@media (width <= 959px) {
  .press-home-hero {
    grid-template-columns: minmax(0, 1fr);
  }

  .hero-copy {
    padding: 48px 32px;
  }

  .hero-text {
    max-width: 18ch;
  }

  .hero-visual {
    border-left: 0;
    border-top: 1px solid var(--pr-c-divider-light);
    height: 380px;
  }

  .is-centered .hero-visual {
    border-top: 0;
  }
}

@media (width <= 639px) {
  .hero-copy,
  .is-centered .hero-copy {
    padding: 40px 24px;
  }

  .hero-tagline {
    font-size: 16px;
  }

  .hero-visual {
    height: 340px;
  }
}
</style>
