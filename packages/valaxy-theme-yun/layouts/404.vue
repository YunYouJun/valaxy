<script setup lang="ts">
import { useBack, useFrontmatter } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeConfig } from '../composables'

const { t } = useI18n()
const { back } = useBack()
const route = useRoute()
const frontmatter = useFrontmatter()
const themeConfig = useThemeConfig()

const chars = ['4', '0', '4']
// 未知路径匹配不到 404.md，frontmatter 为空时用 locale 兜底
const title = computed(() => frontmatter.value.title || t('not_found.title'))

// 静态托管会把所有未知路径都回落到同一份 404.html，SSG 时的路径不可信，挂载后再读取
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})
const path = computed(() => mounted.value ? route.fullPath : '')

// 预填当前路径，方便定位失效链接
const issueLink = computed(() => {
  const link = themeConfig.value.notFound?.issueLink
  if (!link || !path.value)
    return ''
  if (link.includes(':path'))
    return link.replace(':path', encodeURIComponent(path.value))

  const params = new URLSearchParams({
    title: `404: ${path.value}`,
    body: t('not_found.issue_body', { path: path.value }),
  })
  return `${link}${link.includes('?') ? '&' : '?'}${params}`
})
</script>

<template>
  <main class="yun-404 va-main w-full min-h-screen" text="center" flex="~ col" justify="center" items="center">
    <div class="yun-404-line top" />

    <h1 class="yun-404-code" aria-label="404">
      <span
        v-for="(char, i) in chars" :key="i"
        class="yun-404-char" :style="{ '--char-index': i }"
        aria-hidden="true"
      >{{ char }}</span>
    </h1>

    <div class="yun-404-line bottom" />

    <p class="yun-404-title yun-404-fade">
      {{ title }}
    </p>
    <code class="yun-404-path yun-404-fade">{{ path }}</code>

    <div class="yun-404-actions yun-404-fade" flex="~ wrap" justify="center" items="center" gap="3">
      <button class="btn rounded-full" p="x-6 y-2" text="sm" :title="t('button.back')" @click="back">
        {{ t('button.back') }}
      </button>
      <!-- a 元素自带 text 属性，不能用 attributify 的 text="sm" -->
      <a
        v-if="issueLink"
        class="yun-404-report inline-flex items-center gap-1 text-sm"
        :href="issueLink" target="_blank" rel="noopener"
      >
        <div class="yun-404-report-icon" i-ri-github-line />
        {{ t('not_found.report') }}
      </a>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use 'sass:map';
@use 'valaxy-theme-yun/styles/vars.scss' as *;

$ease-in: map.get($cubic-bezier, 'ease-in');
$line-duration: 0.4s;
$char-duration: 0.4s;
$char-stagger: 0.08s;

// banner 的颜色变量只在 YunBanner 挂载时存在，这里单独定义
.yun-404 {
  --yun-404-line-color: var(--va-c-text-3);
  --yun-404-char-size: clamp(4rem, 18vw, 8rem);

  padding: 2rem 1rem;
}

// 与首页 banner 一致：竖线先延伸，字块再浮现
.yun-404-line {
  width: 1px;
  height: 0;
  background-color: var(--yun-404-line-color);
  animation: yun-404-extend $line-duration $ease-in forwards;

  &.top {
    --yun-404-line-height: 12vh;
  }

  &.bottom {
    --yun-404-line-height: 4vh;

    animation-delay: calc($line-duration + $char-duration + 2 * $char-stagger);
  }
}

.yun-404-code {
  display: flex;
  margin: 0;
  font-family: var(--va-font-serif);
  font-size: var(--yun-404-char-size);
  font-weight: 900;
  line-height: 1;
}

.yun-404-char {
  padding: 0.08em 0.16em;
  color: var(--va-c-text);
  border: 1px solid var(--yun-404-line-color);
  opacity: 0;
  transition:
    color var(--va-transition-duration) ease-in-out,
    background-color var(--va-transition-duration) ease-in-out;
  animation: yun-404-char-in $char-duration $ease-in forwards;
  animation-delay: calc($line-duration + var(--char-index) * $char-stagger);

  & + & {
    margin-left: -1px;
  }

  &:hover {
    color: var(--va-c-bg);
    background-color: var(--va-c-text);
  }
}

.yun-404-fade {
  opacity: 0;
  animation: yun-404-fade-in var(--va-transition-duration-moderate) ease-out forwards;
  animation-delay: calc(2 * $line-duration + $char-duration + 2 * $char-stagger);
}

.yun-404-title {
  margin: 1rem 0 0.25rem;
  font-family: var(--va-font-serif);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.yun-404-path {
  max-width: 100%;
  min-height: 1.5em;
  overflow-wrap: anywhere;
  font-size: 0.8rem;
  color: var(--va-c-text-3);
  background: none;
}

.yun-404-actions {
  margin-top: 2rem;
}

.yun-404-report {
  padding: 0.5rem 1.25rem;
  color: var(--va-c-text-2);
  border: 1px solid var(--yun-404-line-color);
  border-radius: 9999px;
  transition:
    color var(--va-transition-duration),
    border-color var(--va-transition-duration),
    background-color var(--va-transition-duration);

  // 胶囊形按钮不用 yun-title-effects，角标会落在圆角外
  &:hover,
  &:focus-visible {
    color: var(--va-c-primary);
    border-color: var(--va-c-primary);
    background-color: rgb(var(--va-c-primary-rgb), 0.08);
  }

  &:focus-visible {
    outline: 2px solid rgb(var(--va-c-primary-rgb), 0.4);
    outline-offset: 2px;
  }

  &-icon {
    transition: transform var(--va-transition-duration) $ease-in;
  }

  &:hover &-icon,
  &:focus-visible &-icon {
    transform: rotate(-12deg) scale(1.15);
  }
}

@keyframes yun-404-extend {
  to {
    height: var(--yun-404-line-height);
  }
}

@keyframes yun-404-char-in {
  from {
    opacity: 0;
    transform: translateY(0.15em);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes yun-404-fade-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .yun-404-line,
  .yun-404-char,
  .yun-404-fade {
    animation: none;
    opacity: 1;
  }

  .yun-404-line.top,
  .yun-404-line.bottom {
    height: var(--yun-404-line-height);
  }
}
</style>
