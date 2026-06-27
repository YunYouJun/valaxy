<script lang="ts" setup>
import type { NotFoundLocale } from '../components/PressNotFoundLocaleToggle.vue'
import { useBack } from 'valaxy'
import { computed, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import PressNotFoundLocaleToggle from '../components/PressNotFoundLocaleToggle.vue'
import PressNotFoundVisual from '../components/PressNotFoundVisual.vue'

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

const activeLocale = shallowRef<NotFoundLocale>(
  route.path.startsWith('/zh') || locale.value.startsWith('zh') ? 'zh' : 'en',
)

const languageOptions: { label: string, value: NotFoundLocale }[] = [
  { label: '中文', value: 'zh' },
  { label: 'EN', value: 'en' },
]

const content = computed(() => messages[activeLocale.value])
const currentPath = computed(() => route.fullPath || route.path)
const homeLink = computed(() => activeLocale.value === 'zh' ? '/zh/' : '/')
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

            <PressNotFoundLocaleToggle v-model="activeLocale" :options="languageOptions" />
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

    <PressFooter />
  </div>
</template>

<style lang="scss" scoped>
.not-found-shell {
  min-height: calc(100svh - var(--pr-nav-height));
  display: grid;
  place-items: center;
  padding: calc(var(--pr-nav-height) + clamp(24px, 5vw, 56px)) clamp(18px, 5vw, 72px) clamp(40px, 6vw, 80px);
}

.not-found-panel {
  width: min(100%, 1040px);
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
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
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
  margin: 20px 0 0;
  color: var(--vp-c-text-2);
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: 1.8;
}

.not-found-path {
  display: grid;
  gap: 8px;
  max-width: 100%;
  margin: 24px 0 0;
  padding: 14px 16px;
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
  margin-top: 28px;
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
  .not-found-shell {
    min-height: auto;
    padding: clamp(20px, 6vw, 32px) clamp(18px, 5vw, 24px) clamp(36px, 8vw, 48px);
  }

  .not-found-panel {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .not-found-toolbar {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .not-found-title {
    max-width: 11ch;
    font-size: clamp(2rem, 10vw, 3.25rem);
  }

  .not-found-description {
    margin-top: 14px;
    line-height: 1.7;
  }

  .not-found-path {
    margin-top: 18px;
  }

  .not-found-actions,
  .not-found-action {
    width: 100%;
  }

  .not-found-actions {
    margin-top: 18px;
  }
}
</style>
