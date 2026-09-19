<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  /** Language used for the feature copy and real DevTools preview. */
  lang: 'zh' | 'en'
}>()

const copies = {
  zh: {
    title: '博客管理，也得心应手。',
    description: '在 Valaxy DevTools 中整理文章、调整配置、查看页面信息。日常管理，都有直观的入口。',
    features: [
      { title: '文章管理', description: '搜索文章、筛选草稿，编辑标题、分类与标签。' },
      { title: '可视化配置', description: '调整站点与框架配置，保存回本地源文件。' },
      { title: '页面调试', description: '随页面查看路由、Frontmatter 与响应式断点。' },
    ],
    action: '了解 Valaxy DevTools',
    note: '随本地开发模式开启，生产站点无需加载。',
    caption: 'Valaxy DevTools · 文章管理界面',
    alt: 'Valaxy DevTools 真实界面，左侧为文章列表，右侧为标题、日期、分类与标签编辑区',
  },
  en: {
    title: 'Your blog, in clear view.',
    description: 'Organize posts, adjust settings, and inspect pages in Valaxy DevTools. Everyday blog tasks, with a visual workspace.',
    features: [
      { title: 'Post management', description: 'Search posts, filter drafts, and edit titles, categories, and tags.' },
      { title: 'Visual configuration', description: 'Adjust site and framework settings, then save them to your local source files.' },
      { title: 'Page debugging', description: 'Inspect routes, frontmatter, and responsive breakpoints as you navigate.' },
    ],
    action: 'Explore Valaxy DevTools',
    note: 'Available during local development. Excluded from your production site.',
    caption: 'Valaxy DevTools · Post management',
    alt: 'Real Valaxy DevTools interface with a post list on the left and title, date, category, and tag fields on the right',
  },
}
const copy = computed(() => copies[props.lang])
const prefix = computed(() => props.lang === 'zh' ? '/zh' : '')
const featureIcons = ['i-ri-article-line', 'i-ri-equalizer-line', 'i-ri-bug-line']
</script>

<template>
  <section id="home-devtools" class="home-devtools" aria-labelledby="home-devtools-title">
    <div class="devtools-heading">
      <div>
        <p class="devtools-eyebrow">
          VALAXY DEVTOOLS
        </p>
        <h2 id="home-devtools-title" class="devtools-title">
          {{ copy.title }}
        </h2>
        <p class="devtools-description">
          {{ copy.description }}
        </p>
      </div>
      <RouterLink class="devtools-link" :to="`${prefix}/guide/config/extend#devtools`">
        {{ copy.action }} <span aria-hidden="true">↗</span>
      </RouterLink>
    </div>
    <div class="devtools-content">
      <div class="devtools-features">
        <article v-for="(feature, index) in copy.features" :key="feature.title" class="devtools-feature">
          <span class="feature-icon" :class="featureIcons[index]" aria-hidden="true" />
          <h3 class="feature-title">
            {{ feature.title }}
          </h3>
          <p class="feature-description">
            {{ feature.description }}
          </p>
        </article>
        <p class="devtools-note">
          {{ copy.note }}
        </p>
      </div>
      <figure class="devtools-preview">
        <div class="devtools-window">
          <div class="devtools-toolbar" aria-hidden="true">
            <span class="window-dots"><i /><i /><i /></span>
            <span>Valaxy DevTools</span>
          </div>
          <img
            class="preview-light" :src="`/release/devtools-${lang}-preview.webp`" :alt="copy.alt"
            width="1320" height="650" loading="lazy" decoding="async"
          >
          <img
            class="preview-dark" :src="`/release/devtools-${lang}-dark-preview.webp`" :alt="copy.alt"
            width="1320" height="650" loading="lazy" decoding="async"
          >
        </div>
        <figcaption class="devtools-caption">
          {{ copy.caption }}
        </figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.home-devtools {
  padding: 64px clamp(24px, 4vw, 56px);
  border-bottom: 1px solid var(--pr-c-divider-light);
}

.devtools-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}

.devtools-eyebrow {
  margin: 0 0 24px;
  color: var(--pr-c-brand);
  font-family: var(--pr-font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.devtools-title {
  margin: 0;
  font-family: var(--pr-font-display);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.3;
}

.devtools-description {
  max-width: 38em;
  margin: 20px 0 0;
  color: var(--pr-c-text-2);
  font-size: 15px;
  line-height: 1.85;
}

.devtools-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--pr-c-brand);
  font-size: 14px;
  font-weight: 600;
}

.devtools-link:hover {
  text-decoration: underline;
}

.devtools-link:focus-visible {
  outline: 2px solid var(--pr-c-brand);
  outline-offset: 4px;
}

.devtools-content {
  display: grid;
  grid-template-columns: minmax(180px, 0.75fr) minmax(0, 2fr);
  align-items: center;
  gap: 48px;
  margin-top: 48px;
}

.devtools-features {
  display: grid;
  gap: 28px;
}

.devtools-feature {
  position: relative;
  padding-left: 32px;
}

.feature-icon {
  position: absolute;
  top: 3px;
  left: 0;
  color: var(--pr-c-brand);
  font-size: 20px;
}

.feature-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.feature-description {
  margin: 8px 0 0;
  color: var(--pr-c-text-2);
  font-size: 13px;
  line-height: 1.85;
}

.devtools-note {
  margin: 0;
  color: var(--pr-c-text-2);
  font-size: 12px;
  line-height: 1.8;
}

.devtools-preview {
  min-width: 0;
  margin: 0;
}

.devtools-window {
  overflow: hidden;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 12px;
  background: var(--pr-c-bg);
  box-shadow: 0 12px 48px var(--pr-c-orbit-glow);
}

.devtools-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid var(--pr-c-divider-light);
  color: var(--pr-c-text-2);
  background: var(--pr-c-surface);
  font-family: var(--pr-font-mono);
  font-size: 11px;
}

.window-dots {
  display: flex;
  gap: 5px;
}

.window-dots i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--pr-c-divider-light);
}

.preview-light, .preview-dark {
  display: block;
  width: 100%;
  height: auto;
}

.preview-dark {
  display: none;
}

:global(.dark .home-devtools .preview-light) {
  display: none;
}

:global(.dark .home-devtools .preview-dark) {
  display: block;
}

.devtools-caption {
  margin-top: 16px;
  color: var(--pr-c-text-2);
  font-size: 12px;
  text-align: center;
}

@media (width <= 959px) {
  .devtools-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .devtools-features {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
  }

  .devtools-note {
    grid-column: 1 / -1;
  }
}

@media (width <= 639px) {
  .home-devtools {
    padding: 40px 24px;
  }

  .devtools-content {
    margin-top: 32px;
  }

  .devtools-features {
    grid-template-columns: 1fr;
  }
}
</style>
