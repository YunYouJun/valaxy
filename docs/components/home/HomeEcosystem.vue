<script setup lang="ts">
import { useDocumentVisibility, useElementVisibility } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef } from 'vue'

const props = defineProps<{
  /** Language of the documentation page. */
  lang: 'zh' | 'en'
}>()

const copies = {
  zh: {
    title: '熟悉的工具，\n更多的可能。',
    description: '写作、主题与构建，共用一套熟悉的前端生态。让已有的组件、样式和插件，继续发挥作用。',
    vue: '已有组件，直接复用',
    vueText: '将 Vue 组件放入文章，组合图表、演示与交互。',
    vite: '插件生态，自然接入',
    viteText: '复用 Vite 插件处理资源，让博客融入你的工作流。',
    link: '探索 Vue 与 Vite 集成',
    diagram: 'Valaxy 与 Vue、Vite、Markdown、UnoCSS、TypeScript 和 VueUse 的集成关系',
    caption: '为写作与定制，协同工作。',
    pause: '暂停集成动画',
    resume: '播放集成动画',
  },
  en: {
    title: 'Familiar tools.\nMore possibilities.',
    description: 'Writing, themes, and builds share a familiar frontend ecosystem. Put your existing components, styles, and plugins to work.',
    vue: 'Bring your Vue components',
    vueText: 'Reuse components in your posts, from charts to interactive demos.',
    vite: 'Bring your Vite plugins',
    viteText: 'Use plugins for assets and build steps that fit your workflow.',
    link: 'Explore Vue and Vite integrations',
    diagram: 'Valaxy integrates with Vue, Vite, Markdown, UnoCSS, TypeScript, and VueUse',
    caption: 'Working together, for your words and ideas.',
    pause: 'Pause integration animation',
    resume: 'Play integration animation',
  },
}
const copy = computed(() => copies[props.lang])
const prefix = computed(() => props.lang === 'zh' ? '/zh' : '')
const integrations = [
  { name: 'Vue', icon: 'i-logos:vue', href: 'https://vuejs.org/', x: 23, y: 19, path: 'M115 76 Q115 200 250 200' },
  { name: 'Vite', icon: 'i-logos:vitejs', href: 'https://vite.dev/', x: 77, y: 19, path: 'M385 76 Q385 200 250 200' },
  { name: 'Markdown', icon: 'i-logos:markdown', href: 'https://commonmark.org/', x: 13, y: 51, path: 'M65 204 L250 200' },
  { name: 'UnoCSS', icon: 'i-logos:unocss', href: 'https://unocss.dev/', x: 87, y: 51, path: 'M435 204 L250 200' },
  { name: 'TypeScript', icon: 'i-logos:typescript-icon', href: 'https://www.typescriptlang.org/', x: 26, y: 82, path: 'M130 328 Q130 200 250 200' },
  { name: 'VueUse', icon: 'i-logos:vueuse', href: 'https://vueuse.org/', x: 74, y: 82, path: 'M370 328 Q370 200 250 200' },
]

const scene = useTemplateRef<HTMLElement>('scene')
const visible = useElementVisibility(scene)
const documentVisibility = useDocumentVisibility()
const paused = shallowRef(false)
const playing = computed(() => visible.value && documentVisibility.value === 'visible' && !paused.value)
</script>

<template>
  <section class="home-ecosystem" aria-labelledby="home-ecosystem-title">
    <div class="ecosystem-copy">
      <p class="ecosystem-eyebrow">
        VUE + VITE
      </p>
      <h2 id="home-ecosystem-title" class="ecosystem-title">
        {{ copy.title }}
      </h2>
      <p class="ecosystem-description">
        {{ copy.description }}
      </p>
      <div class="ecosystem-foundations">
        <article class="ecosystem-foundation">
          <span class="foundation-icon i-logos:vue" aria-hidden="true" />
          <div>
            <h3 class="foundation-title">
              {{ copy.vue }}
            </h3>
            <p class="foundation-description">
              {{ copy.vueText }}
            </p>
          </div>
        </article>
        <article class="ecosystem-foundation">
          <span class="foundation-icon i-logos:vitejs" aria-hidden="true" />
          <div>
            <h3 class="foundation-title">
              {{ copy.vite }}
            </h3>
            <p class="foundation-description">
              {{ copy.viteText }}
            </p>
          </div>
        </article>
      </div>
      <RouterLink class="ecosystem-link" :to="`${prefix}/guide/third-party/vite-vue`">
        {{ copy.link }} <span aria-hidden="true">↗</span>
      </RouterLink>
    </div>

    <figure ref="scene" class="ecosystem-visual" :class="{ 'is-playing': playing }" :aria-label="copy.diagram">
      <div class="ecosystem-map">
        <svg class="ecosystem-connections" viewBox="0 0 500 400" preserveAspectRatio="none" fill="none" aria-hidden="true">
          <path v-for="integration in integrations" :key="integration.name" class="connection-track" :d="integration.path" />
          <path
            v-for="(integration, index) in integrations" :key="`${integration.name}-pulse`"
            class="connection-pulse" :d="integration.path" pathLength="100"
            :style="{ animationDelay: `${index * -0.9}s` }"
          />
        </svg>
        <div class="ecosystem-hub">
          <img src="/valaxy-logo.png" alt="" width="64" height="59" loading="lazy" decoding="async">
          <span>VALAXY</span>
        </div>
        <a
          v-for="integration in integrations" :key="integration.name" class="ecosystem-node"
          :href="integration.href" target="_blank" rel="noopener noreferrer"
          :style="{ left: `${integration.x}%`, top: `${integration.y}%` }"
        >
          <span class="node-icon" :class="integration.icon" aria-hidden="true" />
          <span class="node-name">{{ integration.name }}</span>
        </a>
      </div>
      <figcaption class="ecosystem-caption">
        {{ copy.caption }}
      </figcaption>
      <button
        class="ecosystem-motion" type="button" :aria-label="copy.pause" :aria-pressed="paused"
        :title="paused ? copy.resume : copy.pause" @click="paused = !paused"
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
          <path v-if="paused" d="M5 3 13 8 5 13Z" />
          <path v-else d="M4 3h3v10H4zm5 0h3v10H9z" />
        </svg>
      </button>
    </figure>
  </section>
</template>

<style scoped>
.home-ecosystem {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--pr-c-divider-light);
}

.ecosystem-copy {
  padding: 64px clamp(24px, 4vw, 56px);
}

.ecosystem-eyebrow {
  margin: 0 0 24px;
  color: var(--pr-c-brand);
  font-family: var(--pr-font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.ecosystem-title {
  margin: 0;
  font-family: var(--pr-font-display);
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.4;
  white-space: pre-line;
}

.ecosystem-description,
.foundation-description {
  color: var(--pr-c-text-2);
  line-height: 1.85;
}

.ecosystem-description {
  margin: 20px 0 0;
  font-size: 15px;
}

.ecosystem-foundations {
  display: grid;
  gap: 24px;
  margin-top: 32px;
}

.ecosystem-foundation {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.foundation-icon {
  flex-shrink: 0;
  margin-top: 4px;
  font-size: 24px;
}

.foundation-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.foundation-description {
  margin: 8px 0 0;
  font-size: 14px;
}

.ecosystem-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 32px;
  color: var(--pr-c-brand);
  font-size: 14px;
  font-weight: 600;
}

.ecosystem-link:hover {
  text-decoration: underline;
}

.ecosystem-visual {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  margin: 0;
  padding: 40px 24px 64px;
  border-left: 1px solid var(--pr-c-divider-light);
  background: radial-gradient(ellipse at center, var(--pr-c-brand-soft), transparent 65%);
}

.ecosystem-map {
  position: relative;
  width: 100%;
  max-width: 480px;
  aspect-ratio: 1;
}

.ecosystem-connections {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.connection-track {
  stroke: var(--pr-c-orbit-line);
  stroke-width: 1;
}

.connection-pulse {
  stroke: var(--pr-c-brand);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-dasharray: 8 92;
  animation: ecosystem-flow 6s linear infinite;
  animation-play-state: paused;
}

.is-playing .connection-pulse {
  animation-play-state: running;
}

.ecosystem-hub,
.ecosystem-node {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
}

.ecosystem-hub {
  top: 50%;
  left: 50%;
  width: 25%;
  aspect-ratio: 1;
  gap: 10px;
  border: 1px solid var(--pr-c-orbit-line);
  border-radius: 24px;
  background: var(--pr-c-bg);
  box-shadow: 0 0 48px var(--pr-c-orbit-glow);
  font-family: var(--pr-font-mono);
  font-size: 10px;
  letter-spacing: 0.12em;
  line-height: 1.3;
}

.ecosystem-hub img {
  display: block;
  width: 52%;
  height: auto;
  margin: 0;
  flex-shrink: 0;
}

.ecosystem-node {
  width: 22%;
  aspect-ratio: 1;
  gap: 12px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 16px;
  color: var(--pr-c-text-2);
  background: var(--pr-c-bg);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ecosystem-node:hover {
  border-color: var(--pr-c-brand);
  box-shadow: 0 4px 24px var(--pr-c-orbit-glow);
}

.node-icon {
  font-size: 30px;
  flex-shrink: 0;
}

.node-name {
  font-family: var(--pr-font-body);
  font-size: 12px;
  line-height: 1.3;
  letter-spacing: normal;
  white-space: nowrap;
}

:global(.dark .home-ecosystem .node-icon[class~='i-logos:markdown']) {
  filter: invert(1);
}

.ecosystem-caption {
  margin-top: 24px;
  color: var(--pr-c-text-2);
  font-size: 12px;
  text-align: center;
}

.ecosystem-motion {
  position: absolute;
  right: 20px;
  bottom: 20px;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 50%;
  color: var(--pr-c-text-2);
  background: var(--pr-c-bg);
  cursor: pointer;
}

.ecosystem-link:focus-visible,
.ecosystem-node:focus-visible,
.ecosystem-motion:focus-visible {
  outline: 2px solid var(--pr-c-brand);
  outline-offset: 4px;
}

@keyframes ecosystem-flow {
  from {
    stroke-dashoffset: 100;
  }

  to {
    stroke-dashoffset: 0;
  }
}

@media (width <= 959px) {
  .home-ecosystem {
    grid-template-columns: 1fr;
  }

  .ecosystem-copy {
    padding: 48px 32px;
  }

  .ecosystem-visual {
    border-left: 0;
    border-top: 1px solid var(--pr-c-divider-light);
  }
}

@media (width <= 639px) {
  .ecosystem-map {
    aspect-ratio: 1;
  }

  .ecosystem-copy {
    padding: 40px 24px;
  }

  .ecosystem-visual {
    padding: 32px 12px 64px;
  }

  .ecosystem-node {
    gap: 8px;
    border-radius: 12px;
  }

  .node-icon {
    font-size: 24px;
  }

  .node-name {
    font-size: 10px;
  }

  .ecosystem-hub {
    border-radius: 18px;
    gap: 8px;
    font-size: 9px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .connection-pulse {
    animation: none;
  }

  .ecosystem-node {
    transition: none;
  }

  .ecosystem-motion {
    display: none;
  }
}
</style>
