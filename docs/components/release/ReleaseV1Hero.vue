<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { computed, shallowRef, useTemplateRef } from 'vue'
import ReleaseV1Galaxy from './ReleaseV1Galaxy.vue'
import ReleaseV1Postcard from './ReleaseV1Postcard.vue'

const props = defineProps<{ copy: ReleaseCopy['hero'], prefix: string }>()

/** hello.md, typed over the core before it unwinds into the arms. */
const seed = computed(() => [
  '---',
  `title: ${props.copy.hello}`,
  '---',
  '',
  `# ${props.copy.hello}`,
  '',
  ...props.copy.story.split(/(?<=[。.])\s*/).filter(Boolean),
])

// Markdown syntax is weighted so it reads as the stuff the galaxy is made of.
const pool = '##--**>>[]()`_~|##--**>>' + 'MarkdownVueVitewordsworldsvalaxy' + '为书写而生向自由而进用记录创造你好世界把日常写成故事让灵感生长文字星系银河页面主题'

const galaxy = useTemplateRef<InstanceType<typeof ReleaseV1Galaxy>>('galaxy')
const input = useTemplateRef<HTMLInputElement>('input')
const caption = useTemplateRef<HTMLElement>('caption')
const form = useTemplateRef<HTMLElement>('form')
const wish = shallowRef('')
const status = shallowRef('')
// The last line sent; it can be turned into a postcard.
const lastWish = shallowRef('')
const postcard = useTemplateRef<InstanceType<typeof ReleaseV1Postcard>>('postcard')

function send() {
  const text = wish.value.trim()
  if (!text || !input.value) {
    input.value?.focus()
    return
  }
  const rect = input.value.getBoundingClientRect()
  const count = galaxy.value?.add(text, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) ?? 0
  status.value = props.copy.wishAdded.replace('{n}', String(count))
  lastWish.value = text
  wish.value = ''
}
</script>

<template>
  <section class="galaxy-hero" aria-labelledby="release-title">
    <ReleaseV1Galaxy ref="galaxy" class="hero-canvas" :seed="seed" :pool="pool" :quiet="[caption, form]" />
    <p class="sr-only">
      {{ copy.galaxy }}
    </p>

    <div ref="caption" class="hero-caption">
      <h1 id="release-title">
        <span>{{ copy.title[0] }}</span>
        <span>{{ copy.title[1] }}</span>
      </h1>
      <p class="hero-description">
        {{ copy.description }}
      </p>
      <div class="hero-actions">
        <RouterLink class="hero-primary" :to="`${prefix}/guide/getting-started`">
          {{ copy.primary }}
        </RouterLink>
        <a class="hero-secondary" href="#highlights">{{ copy.secondary }}</a>
      </div>
    </div>

    <form ref="form" class="hero-wish" @submit.prevent="send">
      <label for="release-wish">{{ copy.wishLabel }}</label>
      <div class="wish-row">
        <input
          id="release-wish"
          ref="input"
          v-model="wish"
          type="text"
          maxlength="40"
          autocomplete="off"
          :placeholder="copy.wishPlaceholder"
        >
        <button type="submit">
          {{ copy.wishSubmit }}
        </button>
      </div>
      <div class="wish-status">
        <span role="status">{{ status }}</span>
        <button v-if="lastWish" type="button" class="wish-postcard" @click="postcard?.open(lastWish)">
          {{ copy.postcardOpen }}
        </button>
      </div>
    </form>
    <ReleaseV1Postcard ref="postcard" :copy="copy.postcard" />

    <!-- A plate title, as engraved in the corner of an atlas sheet. -->
    <div class="hero-plate">
      <p>
        <span class="plate-name">Valaxy 1.0</span>
        <span>{{ copy.plate }}</span>
      </p>
      <button type="button" class="hero-replay" :aria-label="copy.replay" :title="copy.replay" @click="galaxy?.replay()">
        <span class="i-ri-restart-line" aria-hidden="true" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.galaxy-hero {
  --plate: #0a1a4f;
  --paper: #eef3ff;
  --chalk: rgb(255 255 255 / 0.78);
  --rule: rgb(255 255 255 / 0.28);
  --violet: #c9a7ff;

  position: relative;
  isolation: isolate;

  /* The plate runs up under the transparent nav, so the two read as one sheet. */
  margin-top: calc(-1 * var(--pr-nav-height, 60px));
  height: clamp(700px, 100svh, 1000px);
  overflow: hidden;
  color: #fff;
  background: var(--plate);
  font-family: Literata, "LXGW WenKai Screen", Georgia, serif;
}

.galaxy-hero ::selection {
  color: #fff;
  background: #8300ef;
}

.hero-canvas {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.hero-caption {
  position: absolute;
  left: clamp(24px, 5vw, 72px);
  bottom: clamp(32px, 7vh, 72px);
  max-width: min(46rem, 58%);
}

.hero-caption h1 {
  margin: 0;
  font-size: clamp(48px, 5.4vw, 88px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.02em;
  text-wrap: balance;
}

.hero-caption h1 span {
  display: block;
  white-space: nowrap;
}

.hero-description {
  margin: 24px 0 0;
  color: var(--chalk);
  font-size: clamp(18px, 1.6vw, 22px);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 28px;
  margin-top: 32px;
}

.hero-primary {
  padding: 13px 24px;
  border-radius: 4px;
  color: var(--plate);
  background: var(--paper);
  font-size: 16px;
  font-weight: 600;
  transition: background-color 160ms;
}

.hero-primary:hover {
  background: #fff;
  text-decoration: none;
}

.hero-secondary {
  color: #fff;
  font-size: 16px;
  text-decoration: underline;
  text-decoration-color: var(--rule);
  text-underline-offset: 6px;
  transition: text-decoration-color 160ms;
}

.hero-secondary:hover {
  text-decoration-color: currentcolor;
}

.hero-wish {
  position: absolute;
  right: clamp(24px, 5vw, 72px);
  bottom: clamp(32px, 7vh, 72px);
  width: min(380px, 100% - 48px);
}

.hero-wish label {
  display: block;
  margin-bottom: 10px;
  color: var(--chalk);
  font-size: 15px;
}

.wish-row {
  display: flex;
  gap: 8px;
}

.wish-row input {
  flex: 1;
  min-width: 0;
  height: 46px;
  padding: 0 14px;
  border: 1px solid var(--rule);
  border-radius: 4px;
  color: #fff;
  background: rgb(10 26 79 / 0.6);
  font: inherit;
  font-size: 16px;
  caret-color: var(--violet);
}

.wish-row input::placeholder {
  color: rgb(255 255 255 / 0.42);
}

.wish-row button {
  flex: none;
  height: 46px;
  padding: 0 16px;
  border: 1px solid rgb(255 255 255 / 0.6);
  border-radius: 4px;
  color: #fff;
  background: transparent;
  font: inherit;
  font-size: 15px;
  transition: background-color 160ms;
}

.wish-row button:hover {
  background: rgb(255 255 255 / 0.1);
}

.wish-status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
  min-height: 1.5em;
  margin: 10px 0 0;
  color: var(--violet);
  font-size: 14px;
}

.wish-postcard {
  padding: 0;
  border: 0;
  color: #fff;
  background: none;
  font: inherit;
  font-size: 14px;
  text-decoration: underline;
  text-decoration-color: var(--rule);
  text-underline-offset: 5px;
}

.wish-postcard:hover {
  text-decoration-color: currentcolor;
}

.hero-plate {
  position: absolute;
  top: calc(var(--pr-nav-height, 60px) + 28px);
  left: clamp(24px, 5vw, 72px);
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-plate p {
  margin: 0;
  padding-left: 14px;
  border-left: 1px solid var(--rule);
  color: var(--chalk);
  font-size: 14px;
  line-height: 1.5;
}

.hero-plate p span {
  display: block;
}

.plate-name {
  color: #fff;
  font-size: 18px;
  font-style: italic;
}

.hero-replay {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--rule);
  border-radius: 50%;
  color: var(--chalk);
  background: transparent;
  font-size: 16px;
  transition: color 160ms, border-color 160ms;
}

.hero-replay:hover {
  color: #fff;
  border-color: #fff;
}

.galaxy-hero :focus-visible {
  outline: 2px solid var(--violet);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .hero-replay {
    display: none;
  }
}

/* Phones: galaxy across the top, caption and form stacked beneath it. */
@media (width < 768px) {
  .galaxy-hero {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 32px;
    height: auto;
    min-height: 780px;
    padding: 0 24px 32px;
  }

  .hero-caption,
  .hero-wish {
    position: static;
    width: auto;
    max-width: none;
  }

  .hero-caption h1 {
    font-size: 46px;
  }

  .hero-caption h1 span {
    white-space: normal;
  }

  .hero-plate {
    top: calc(var(--pr-nav-height, 60px) + 16px);
    left: 24px;
  }
}
</style>
