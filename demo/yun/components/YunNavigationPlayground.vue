<script setup lang="ts">
import type { YunTheme } from 'valaxy-theme-yun'
import { useAppStore, useSiteConfig, useValaxyI18n } from 'valaxy'
import { useThemeConfig } from 'valaxy-theme-yun/client'
import { ref, shallowRef } from 'vue'

const app = useAppStore()
const site = useSiteConfig()
const theme = useThemeConfig()
const { $t } = useValaxyI18n()
const width = shallowRef('390')
const pages = ref(theme.value.pages.map(page => ({ ...page, iconColor: page.iconColor || '#0078E7' })))
const variants: { value: YunTheme.HomeNavStyle, name: string, description: string }[] = [
  { value: 'plain', name: '轻盈文字（默认）', description: '彩色图标配留白，安静、轻巧，适合个人博客。' },
  { value: 'glass', name: '玻璃胶囊', description: '边缘反光与背景透色，适合偏好玻璃质感的页面。' },
  { value: 'panel', name: '分组磨砂', description: '一层磨砂承载全部入口，整齐且容易扫读。' },
  { value: 'tiles', name: '彩色图标底座', description: '色彩集中在小图标上，更活泼、有辨识度。' },
]
</script>

<template>
  <section class="nav-playground">
    <div class="preview-controls">
      <label>
        预览宽度
        <select v-model="width">
          <option value="390">390px</option>
          <option value="320">320px</option>
        </select>
      </label>
      <button type="button" @click="app.toggleDark()">
        {{ app.isDark ? '切换浅色' : '切换深色' }}
      </button>
    </div>

    <fieldset class="preview-colors">
      <legend>图标配色 · 修改后四组同步预览</legend>
      <label v-for="page in pages" :key="page.url">
        <input v-model="page.iconColor" type="color" :aria-label="`${page.name}图标颜色`">
        {{ page.name }}
      </label>
    </fieldset>

    <div class="preview-grid">
      <article v-for="variant in variants" :key="variant.value" class="preview-option" :data-variant="variant.value">
        <h3>{{ variant.name }}</h3>
        <p>{{ variant.description }}</p>
        <div class="preview-screen" :style="{ maxWidth: `${width}px` }">
          <YunPrologue :grid="{ enable: true, fade: true }">
            <div class="preview-content">
              <div class="preview-identity">
                <img :src="site.author.avatar" alt="" width="44" height="44">
                <span>{{ $t(site.author.name) }}</span>
              </div>
              <YunPrologueNavigation :variant="variant.value" :pages="pages" compact />
            </div>
          </YunPrologue>
        </div>
        <code>banner.navStyle: '{{ variant.value }}'</code>
      </article>
    </div>
  </section>
</template>

<style scoped lang="scss">
.nav-playground {
  width: 100%;

  button, select {
    min-height: 40px;
    padding: 6px 12px;
    border: 1px solid color-mix(in srgb, var(--va-c-text) 18%, transparent);
    border-radius: 8px;
    background: var(--va-c-bg);
    color: var(--va-c-text);
    font: inherit;
  }

  button { cursor: pointer; }
}

.preview-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.preview-colors {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  padding: 12px 0;
  margin: 20px 0;
  border: 0;

  legend {
    font-size: 14px;
    color: var(--va-c-text-2);
  }

  label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
  }

  input {
    width: 32px;
    height: 32px;
    padding: 2px;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 320px), 1fr));
  gap: 28px 20px;
}

.preview-option {
  min-width: 0;

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 500;
  }

  p {
    margin: 0 0 12px;
    font-size: 14px;
    color: var(--va-c-text-2);
  }

  code {
    display: block;
    margin-top: 10px;
    font-size: 12px;
  }
}

.preview-screen {
  width: 100%;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--va-c-text) 10%, transparent);
  border-radius: 24px;
  background:
    radial-gradient(ellipse at 0% 45%, color-mix(in srgb, var(--va-c-primary) 14%, transparent), transparent 70%),
    var(--va-c-bg);
}

.preview-content { padding: 24px 20px; }

.preview-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--va-c-text);
  font-size: 16px;
  font-weight: 500;

  img {
    margin: 0;
    border-radius: 50%;
  }
}
</style>
