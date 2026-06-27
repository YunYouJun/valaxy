<script lang="ts" setup>
import { useBack } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PressNotFoundVisual from '../components/PressNotFoundVisual.vue'

type NotFoundLocale = 'en' | 'zh'

const route = useRoute()
const { locale } = useI18n()
const { back } = useBack()

const messages = {
  en: {
    eyebrow: 'Lost route',
    title: 'This page drifted out of orbit.',
    description: 'The address you opened does not match a page in this site. Check the path, return to the last page, or restart from the home page.',
    currentPath: 'Current path',
    back: 'Go back',
    home: 'Home',
    orbit: 'Route signal',
  },
  zh: {
    eyebrow: '路线迷航',
    title: '这个页面暂时偏离了轨道。',
    description: '当前地址没有匹配到站点页面。你可以检查路径，返回上一页，或从首页重新出发。',
    currentPath: '当前路径',
    back: '返回上一页',
    home: '回到首页',
    orbit: '路由信号',
  },
} as const

const currentLocale = computed<NotFoundLocale>(
  () => locale.value.startsWith('zh') || route.path.startsWith('/zh') ? 'zh' : 'en',
)

const content = computed(() => messages[currentLocale.value])
const currentPath = computed(() => route.fullPath || route.path)
const homeLink = computed(() => currentLocale.value === 'zh' ? '/zh/' : '/')
</script>

<template>
  <div class="layout antialiased not-found-layout">
    <PressNav />
    <main class="not-found-shell">
      <section class="not-found-panel" aria-labelledby="not-found-title">
        <PressNotFoundVisual :label="content.orbit" />

        <div class="not-found-copy">
          <div class="not-found-toolbar">
            <p class="not-found-eyebrow">
              <span i-ri-compass-3-line aria-hidden="true" />
              {{ content.eyebrow }}
            </p>
          </div>

          <h1 id="not-found-title" class="not-found-title">
            {{ content.title }}
          </h1>

          <p class="not-found-description">
            {{ content.description }}
          </p>

          <p class="not-found-path">
            <span>{{ content.currentPath }}</span>
            <code>{{ currentPath }}</code>
          </p>

          <div class="not-found-actions">
            <button type="button" class="not-found-action primary" @click="back">
              <span i-ri-arrow-left-line aria-hidden="true" />
              {{ content.back }}
            </button>

            <AppLink class="not-found-action secondary" :href="homeLink">
              <span i-ri-home-4-line aria-hidden="true" />
              {{ content.home }}
            </AppLink>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.not-found-layout {
  min-height: 100svh;
  overflow: hidden;
}

.not-found-shell {
  min-height: 100svh;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: calc(var(--pr-nav-height) + clamp(16px, 3vw, 28px)) clamp(18px, 5vw, 72px) clamp(20px, 4vw, 40px);
}

.not-found-panel {
  width: min(100%, 1040px);
  max-height: calc(100svh - var(--pr-nav-height) - clamp(36px, 7vw, 68px));
  display: grid;
  grid-template-columns: minmax(280px, .9fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(28px, 6vw, 72px);
}

.not-found-copy {
  min-width: 0;
}

.not-found-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.not-found-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  color: var(--vp-c-brand-1);
  font-size: 14px;
  font-weight: 700;
}

.not-found-title {
  max-width: 12ch;
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(2.25rem, 6vw, 4.75rem);
  line-height: .98;
  letter-spacing: 0;
}

.not-found-description {
  max-width: 42rem;
  margin: 18px 0 0;
  color: var(--vp-c-text-2);
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.7;
}

.not-found-path {
  display: grid;
  gap: 8px;
  max-width: 100%;
  margin: 20px 0 0;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent);
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.not-found-path code {
  display: block;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: var(--vp-c-text-1);
  font-size: 14px;
}

.not-found-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.not-found-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform var(--va-transition-duration), border-color var(--va-transition-duration), background-color var(--va-transition-duration), color var(--va-transition-duration), box-shadow var(--va-transition-duration);
}

.not-found-action:hover {
  transform: translateY(-1px);
}

.not-found-action.primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--vp-c-brand-1) 24%, transparent);
}

.not-found-action.secondary {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

@media (max-width: 767px) {
  .not-found-layout {
    height: 100svh;
    display: flex;
    flex-direction: column;
  }

  .not-found-shell {
    flex: 1;
    min-height: 0;
    padding: clamp(8px, 2.4svh, 16px) clamp(18px, 5vw, 24px) clamp(12px, 3svh, 20px);
  }

  .not-found-panel {
    max-height: 100%;
    grid-template-columns: 1fr;
    align-content: center;
    gap: clamp(8px, 1.6svh, 14px);
  }

  .not-found-toolbar {
    margin-bottom: clamp(8px, 1.8svh, 14px);
  }

  .not-found-title {
    max-width: 13ch;
    font-size: clamp(1.75rem, 8.5vw, 2.75rem);
    line-height: 1;
  }

  .not-found-description {
    margin-top: clamp(8px, 1.6svh, 12px);
    font-size: clamp(.88rem, 3.8vw, 1rem);
    line-height: 1.55;
  }

  .not-found-path {
    gap: 6px;
    margin-top: clamp(10px, 1.8svh, 14px);
    padding: 10px 14px;
  }

  .not-found-path code {
    font-size: 13px;
  }

  .not-found-actions,
  .not-found-action {
    width: 100%;
  }

  .not-found-actions {
    gap: 8px;
    margin-top: clamp(10px, 2svh, 16px);
  }

  .not-found-action {
    min-height: 38px;
  }
}

@media (max-width: 767px) and (max-height: 700px) {
  .not-found-path {
    display: none;
  }

  .not-found-description {
    max-width: 34rem;
  }
}
</style>
