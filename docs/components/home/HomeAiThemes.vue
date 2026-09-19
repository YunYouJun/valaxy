<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ lang: 'zh' | 'en' }>()
const copy = computed(() => props.lang === 'zh'
  ? {
      title: '你的想法，\n长成自己的主题。',
      description: '描述风格与功能，让 AI 编程助手从官方模板开始。主题 Skill 补齐框架约定、页面实现与验证流程。',
      example: '从 AK UI 到 Arknights',
      exampleText: '一套可运行的示例：档案式文章列表、舒适的正文排版，以及深浅色切换。',
      prompt: '生成主题提示词',
      source: '查看示例源码',
      guide: '使用这款主题',
      preview: '在线预览',
      alt: 'Arknights 主题真实预览：边境手记首页、精选文章和归档筛选',
      caption: 'AK UI × VALAXY · 原创风格示例',
      steps: ['描述想法', '生成与定制', '预览与验证'],
    }
  : {
      title: 'Your ideas.\nYour own theme.',
      description: 'Describe the style and features. Your AI coding assistant starts from the official template, guided by a theme Skill that covers framework contracts, implementation and verification.',
      example: 'From AK UI to Arknights',
      exampleText: 'A working example with a filterable archive, considered reading layouts, and light and dark modes.',
      prompt: 'Build a theme prompt',
      source: 'Explore the example',
      guide: 'Use this theme',
      preview: 'Live preview',
      alt: 'Arknights theme preview showing its homepage, featured article and archive filters',
      caption: 'AK UI × VALAXY · ORIGINAL THEME EXAMPLE',
      steps: ['Describe', 'Build and customize', 'Preview and verify'],
    })
const prefix = computed(() => props.lang === 'zh' ? '/zh' : '')
</script>

<template>
  <section class="home-ai-themes" aria-labelledby="home-ai-themes-title">
    <div class="ai-themes-copy">
      <p class="ai-themes-eyebrow">
        AI + YOUR CREATIVITY
      </p>
      <h2 id="home-ai-themes-title">
        {{ copy.title }}
      </h2>
      <p class="ai-themes-description">
        {{ copy.description }}
      </p>
      <ol class="ai-themes-steps">
        <li v-for="(step, index) in copy.steps" :key="step">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>{{ step }}
        </li>
      </ol>
      <RouterLink class="ai-themes-primary" :to="`${prefix}/themes/write#generate-a-theme-with-ai`">
        {{ copy.prompt }} <span aria-hidden="true">↗</span>
      </RouterLink>
    </div>
    <div class="ai-themes-example">
      <figure>
        <img src="/themes/arknights-preview.webp" width="1440" height="1120" :alt="copy.alt" loading="lazy" decoding="async">
        <figcaption>{{ copy.caption }}</figcaption>
      </figure>
      <h3>{{ copy.example }}</h3>
      <p>{{ copy.exampleText }}</p>
      <a class="ai-themes-preview" href="https://arknights.valaxy.site/">{{ copy.preview }} <span aria-hidden="true">↗</span></a>
      <RouterLink class="ai-themes-guide" :to="`${prefix}/themes/arknights`">
        {{ copy.guide }} <span aria-hidden="true">↗</span>
      </RouterLink>
      <a href="https://github.com/valaxyjs/valaxy-theme-arknights">{{ copy.source }} <span aria-hidden="true">↗</span></a>
    </div>
  </section>
</template>

<style scoped>
.home-ai-themes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid var(--pr-c-divider-light);
}

.ai-themes-copy {
  padding: 64px clamp(24px, 4vw, 56px);
}

.ai-themes-eyebrow {
  margin: 0 0 24px;
  color: var(--pr-c-brand, var(--va-c-primary));
  font: 12px var(--pr-font-mono, var(--va-font-mono));
  letter-spacing: 0.12em;
}

.ai-themes-copy h2 {
  margin: 0;
  font-family: var(--pr-font-display, var(--va-font-sans));
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 500;
  letter-spacing: -0.035em;
  line-height: 1.4;
  white-space: pre-line;
}

.ai-themes-description {
  color: var(--pr-c-text-2);
  font-size: 15px;
  line-height: 1.85;
  margin: 20px 0 28px;
}

.ai-themes-steps {
  display: grid;
  gap: 15px;
  margin: 0 0 32px;
  padding: 0;
  list-style: none;
}

.ai-themes-steps li {
  display: flex;
  gap: 14px;
  align-items: center;
  font-size: 14px;
}

.ai-themes-steps span {
  color: var(--pr-c-brand, var(--va-c-primary));
  font: 11px var(--pr-font-mono, var(--va-font-mono));
}

.ai-themes-guide, .ai-themes-preview {
  margin-right: 24px;
}

.ai-themes-primary, .ai-themes-example a {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--pr-c-brand, var(--va-c-primary));
  font-size: 14px;
  font-weight: 600;
  padding-block: 10px;
}

.ai-themes-primary:hover, .ai-themes-example a:hover {
  text-decoration: underline;
}

.ai-themes-primary:focus-visible, .ai-themes-example a:focus-visible {
  outline: 2px solid var(--pr-c-brand, var(--va-c-primary));
  outline-offset: 4px;
}

.ai-themes-example {
  padding: 48px clamp(24px, 4vw, 48px);
  border-left: 1px solid var(--pr-c-divider-light);
  background: var(--pr-c-bg-soft, var(--va-c-bg-soft));
}

.ai-themes-example figure {
  margin: 0 0 28px;
}

.ai-themes-example img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--pr-c-divider-light);
}

.ai-themes-example figcaption {
  margin-top: 12px;
  color: var(--pr-c-text-2);
  font: 10px/1.6 var(--pr-font-mono, var(--va-font-mono));
  letter-spacing: 0.08em;
}

.ai-themes-example h3 {
  font-size: 20px;
  font-weight: 500;
  margin: 0 0 12px;
}

.ai-themes-example p {
  color: var(--pr-c-text-2);
  font-size: 14px;
  line-height: 1.85;
  margin: 0 0 8px;
}

@media (width <= 959px) {
  .home-ai-themes {
    grid-template-columns: 1fr;
  }

  .ai-themes-copy {
    padding: 48px 32px;
  }

  .ai-themes-example {
    border-left: 0;
    border-top: 1px solid var(--pr-c-divider-light);
  }
}

@media (width <= 639px) {
  .ai-themes-copy, .ai-themes-example {
    padding: 40px 24px;
  }
}
</style>
