<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import { computed, shallowRef, useTemplateRef } from 'vue'

const props = defineProps<{ copy: ReleaseCopy['hero'], prefix: string }>()

/**
 * The intro types these lines into the Markdown card one by one; each preview
 * element appears as the line that produces it lands (see `--line` in CSS).
 */
const mdLines = computed(() => [
  { text: '---', mark: true },
  { text: `title: ${props.copy.hello}` },
  { text: '---', mark: true },
  { text: '' },
  { text: `# ${props.copy.hello}`, mark: true },
  { text: '' },
  { text: props.copy.story },
  { text: '' },
  { text: '<MyWorld />', mark: true },
])

/* Re-keying the stage restarts every CSS animation in it. */
const run = shallowRef(0)
const stage = useTemplateRef<HTMLElement>('stage')

/* Mouse-only parallax; touch and pen keep the composition still. */
function onPointerMove(event: PointerEvent) {
  const el = stage.value
  if (!el || event.pointerType !== 'mouse')
    return
  const rect = el.getBoundingClientRect()
  el.style.setProperty('--mx', ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3))
  el.style.setProperty('--my', ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3))
}

function onPointerLeave() {
  stage.value?.style.removeProperty('--mx')
  stage.value?.style.removeProperty('--my')
}
</script>

<template>
  <section class="release-hero" aria-labelledby="release-title">
    <div class="hero-copy">
      <h1 id="release-title">
        <span>{{ copy.title[0] }}</span><span class="release-gradient">{{ copy.title[1] }}</span>
      </h1>
      <p class="hero-description">
        {{ copy.description }}
      </p>
      <div class="hero-actions">
        <RouterLink class="release-button" :to="`${prefix}/guide/getting-started`">
          {{ copy.primary }}
        </RouterLink>
        <a class="release-text-link" href="#highlights">{{ copy.secondary }} <span aria-hidden="true">›</span></a>
      </div>
    </div>
    <div
      :key="run"
      ref="stage"
      class="hero-stage"
      :aria-label="copy.preview"
      role="img"
      @pointermove="onPointerMove"
      @pointerleave="onPointerLeave"
    >
      <span class="hero-version" aria-hidden="true">1.0</span>
      <div class="hero-browser" aria-hidden="true">
        <div class="browser-bar">
          <span class="window-dots"><i /><i /><i /></span><span>your-space.valaxy</span><span>↗</span>
        </div>
        <div class="blog-preview">
          <div class="blog-nav">
            <span>Valaxy</span><span>Stories &nbsp; / &nbsp; About</span>
          </div>
          <div class="blog-body">
            <span class="blog-date" :style="{ '--line': 1 }">A NEW BEGINNING</span>
            <h2 :style="{ '--line': 4 }">
              {{ copy.hello }}
            </h2>
            <p :style="{ '--line': 6 }">
              {{ copy.story }}
            </p>
            <div class="blog-landscape" :style="{ '--line': 8 }">
              <span>Words become worlds.</span>
            </div>
            <p class="blog-footnote" :style="{ '--line': 9 }">
              {{ copy.note }}
            </p>
          </div>
        </div>
      </div>
      <div class="hero-paper" aria-hidden="true">
        <div>⌘ &nbsp; hello.md</div>
        <pre><code><span
          v-for="(line, index) in mdLines"
          :key="index"
          class="md-line"
          :class="{ 'is-mark': line.mark }"
          :style="{ '--line': index }"
        >{{ line.text || ' ' }}</span></code></pre>
      </div>
    </div>
    <button type="button" class="hero-replay" :aria-label="copy.replay" :title="copy.replay" @click="run++">
      <span class="i-ri-replay-line" aria-hidden="true" />
    </button>
  </section>
</template>

<style scoped>
.release-hero {
  position: relative;
  padding-top: clamp(48px, 4.5vw, 64px);
  overflow: clip;
}

.hero-copy {
  position: relative;
  z-index: 2;
  padding: 0 22px;
  text-align: center;
}

.hero-copy h1 {
  font-size: clamp(42px, 5.5vw, 76px);
  font-weight: 700;
  line-height: 1.13;
  letter-spacing: -0.055em;
  margin: 0;
}

.hero-copy h1 span {
  display: block;
}

.hero-description {
  color: var(--release-muted);
  font-size: clamp(17px, 2vw, 24px);
  margin-top: 26px;
}

.hero-actions {
  display: flex;
  gap: 28px;
  align-items: center;
  justify-content: center;
  margin-top: 28px;
}

.hero-stage {
  position: relative;
  width: min(1100px, 100%);
  height: 540px;
  margin: 0 auto;
}

.hero-version {
  position: absolute;
  left: 50%;
  top: -88px;
  transform: translateX(-50%) scaleX(1.5);
  font-size: 570px;
  font-weight: 750;
  letter-spacing: -0.09em;
  line-height: 1.2;
  color: transparent;
  background: var(--release-version-gradient);
  background-clip: text;
}

.hero-browser {
  position: absolute;
  top: 48px;
  left: 16%;
  width: 66%;
  border: 1px solid var(--release-border);
  border-radius: 14px;
  background: var(--release-surface);
  box-shadow: 0 20px 60px #2e1d5c21;
  overflow: hidden;
}

.browser-bar {
  height: 36px;
  background: var(--release-inset);
  border-bottom: 1px solid var(--release-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: var(--release-muted);
  font-size: 10px;
}

.window-dots {
  display: flex;
  gap: 5px;
}

.window-dots i {
  height: 7px;
  width: 7px;
  border-radius: 50%;
  background: #ff6259;
}

.window-dots i:nth-child(2) {
  background: #ffbf2f;
}

.window-dots i:nth-child(3) {
  background: #28c840;
}

.blog-nav {
  display: flex;
  justify-content: space-between;
  padding: 18px 30px;
  font-size: 11px;
}

.blog-nav span:first-child {
  font-size: 15px;
  font-weight: 650;
}

.blog-body {
  padding: 8px 30px 26px;
}

.blog-date {
  font-size: 9px;
  color: var(--release-muted);
  letter-spacing: 2px;
}

.blog-body h2 {
  font-size: 35px;
  letter-spacing: -1px;
  margin: 12px 0;
  font-weight: 650;
}

.blog-body p {
  font-size: 12px;
  color: var(--release-muted);
}

.blog-landscape {
  margin: 24px 0 18px;
  height: 126px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  background: var(--release-art-gradient);
  color: var(--release-art-text);
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 26px;
}

.hero-paper {
  position: absolute;
  width: 290px;
  right: 3%;
  top: 120px;
  rotate: 5deg;
  border: 1px solid var(--release-border);
  border-radius: 10px;
  background: var(--release-surface);
  box-shadow: 0 15px 40px #2e1d5c21;
  font-size: 11px;
  overflow: hidden;
}

.hero-paper > div {
  padding: 14px 20px;
  background: var(--release-inset);
  color: var(--release-muted);
}

.hero-paper pre {
  padding: 22px;
  font-size: 11px;
  line-height: 1.8;
  white-space: pre-wrap;
}

.hero-paper code span {
  color: var(--release-link);
}

.md-line {
  display: block;
  min-height: 1.8em;
}

.md-line.is-mark {
  color: var(--release-link);
}

.hero-replay {
  position: absolute;
  right: max(24px, calc(50% - 530px));
  bottom: 24px;
  z-index: 3;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--release-border);
  border-radius: 50%;
  color: var(--release-muted);
  background: var(--release-surface);
  font-size: 18px;
  transition: color 160ms, border-color 160ms, rotate 400ms var(--release-ease);
}

.hero-replay:hover {
  color: var(--release-accent);
  border-color: currentcolor;
  rotate: -90deg;
}

/*
 * Intro timeline (one pass, ~3s). The Markdown card types one line every
 * --md-step after --md-start, and each preview element with a matching
 * --line appears as that line lands. Everything renders in its final state
 * when motion is reduced, and the parallax only follows a mouse.
 */
@media (prefers-reduced-motion: no-preference) {
  .release-hero {
    --md-start: 1.15s;
    --md-step: 0.16s;
  }

  .hero-copy h1 > span,
  .hero-description,
  .hero-actions {
    animation: release-hero-rise 0.9s var(--release-ease) both;
  }

  .hero-copy h1 > span:last-child { animation-delay: 0.08s; }
  .hero-description { animation-delay: 0.18s; }
  .hero-actions { animation-delay: 0.26s; }

  .hero-version {
    animation: release-version-in 1.6s var(--release-ease) both;
    translate: calc(var(--mx, 0) * 18px) calc(var(--my, 0) * 10px);
    transition: translate 0.8s var(--release-ease);
  }

  .hero-browser {
    animation:
      release-stage-in 1s var(--release-ease) 0.35s both,
      release-glow 1.4s ease-out calc(var(--md-start) + 8 * var(--md-step) + 0.2s) both;
    translate: calc(var(--mx, 0) * -14px) calc(var(--my, 0) * -10px);
    transition: translate 0.8s var(--release-ease);
  }

  .hero-paper {
    animation: release-paper-in 0.9s var(--release-ease) 0.75s both;
    translate: calc(var(--mx, 0) * 26px) calc(var(--my, 0) * 18px);
    transition: translate 0.8s var(--release-ease);
  }

  .md-line {
    animation: release-type 0.42s steps(14, end) both;
    animation-delay: calc(var(--md-start) + var(--line) * var(--md-step));
  }

  /* The caret follows the typing, then keeps blinking at the end of the file. */
  .md-line:last-child::after {
    content: '';
    display: inline-block;
    width: 1px;
    height: 1.1em;
    margin-left: 2px;
    vertical-align: -0.2em;
    background: var(--release-link);
    animation: release-caret 1.1s steps(1) calc(var(--md-start) + 8 * var(--md-step) + 0.4s) infinite both;
  }

  .blog-body > * {
    animation: release-preview-in 0.6s var(--release-ease) both;
    animation-delay: calc(var(--md-start) + var(--line) * var(--md-step) + 0.25s);
  }

  /* `<MyWorld />` mounts as a live component: it pops and a light sweeps across. */
  .blog-body > .blog-landscape {
    background-size: 220% 100%;
    animation:
      release-world-in 0.9s var(--release-ease) both,
      release-sweep 1.6s var(--release-ease) both;
    animation-delay: calc(var(--md-start) + var(--line) * var(--md-step) + 0.3s);
  }

  .hero-replay {
    animation: release-hero-rise 0.6s var(--release-ease) 3s both;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-replay { display: none; }
}

@keyframes release-hero-rise {
  from {
    opacity: 0.01;
    transform: translateY(28px);
  }
}

@keyframes release-version-in {
  from {
    opacity: 0;
    scale: 0.88;
    filter: blur(18px);
  }
}

@keyframes release-stage-in {
  from {
    opacity: 0.01;
    transform: translateY(56px) scale(0.97);
  }
}

@keyframes release-paper-in {
  from {
    opacity: 0.01;
    transform: translate(70px, 40px);
    rotate: 16deg;
  }
}

@keyframes release-type {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0); }
}

@keyframes release-caret {
  50% { opacity: 0; }
}

@keyframes release-preview-in {
  from {
    opacity: 0.01;
    transform: translateY(10px);
  }
}

@keyframes release-world-in {
  0% {
    opacity: 0.01;
    transform: scale(0.92);
  }

  60% {
    opacity: 1;
    transform: scale(1.02);
  }
}

@keyframes release-sweep {
  from { background-position: 100% 0; }
  to { background-position: 0 0; }
}

@keyframes release-glow {
  40% { box-shadow: 0 20px 60px #2e1d5c21, 0 0 0 6px var(--release-glow), 0 0 80px var(--release-glow); }
}

@media (width <= 700px) {
  .hero-stage {
    height: 520px;
    margin-top: 28px;
  }

  .hero-version {
    top: -15px;
    font-size: 350px;
  }

  .hero-browser {
    left: 5%;
    width: 88%;
    top: 68px;
  }

  .hero-paper {
    width: 185px;
    top: 244px;
    right: 3%;
    font-size: 9px;
  }

  .hero-paper pre {
    padding: 12px;
    font-size: 9px;
  }

  .hero-paper > div {
    padding: 9px 12px;
  }

  .blog-landscape {
    height: 80px;
    font-size: 20px;
    margin: 15px 0;
  }

  .blog-body {
    padding: 5px 20px 20px;
  }

  .blog-body h2 {
    font-size: 25px;
  }

  .blog-nav {
    padding: 12px 20px;
  }

  .hero-actions {
    gap: 20px;
    font-size: 14px;
  }

  .blog-footnote {
    max-width: 45%;
  }
}
</style>
