<script setup lang="ts">
import type { ReleaseLocale } from '../../data/release-v1'
import { computed } from 'vue'
import { releaseCopies } from '../../data/release-v1'
import ReleaseV1Appearance from './ReleaseV1Appearance.vue'
import ReleaseV1Closing from './ReleaseV1Closing.vue'
import ReleaseV1Features from './ReleaseV1Features.vue'
import ReleaseV1Hero from './ReleaseV1Hero.vue'
import ReleaseV1Themes from './ReleaseV1Themes.vue'
import ReleaseV1Writing from './ReleaseV1Writing.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps<{ locale: ReleaseLocale }>()
const copy = computed(() => releaseCopies[props.locale])
const prefix = computed(() => props.locale === 'zh' ? '/zh' : '')
</script>

<template>
  <div class="release-page" :lang="copy.lang">
    <a class="release-skip" href="#release-main">{{ copy.nav.skip }}</a>
    <header class="release-nav">
      <div class="release-nav-inner">
        <RouterLink class="release-brand" :to="`${prefix}/`" :aria-label="copy.nav.home">
          <img src="/valaxy-logo.png" alt="" width="24" height="24"> Valaxy <span>1.0</span>
        </RouterLink>
        <nav class="release-links" aria-label="Valaxy 1.0">
          <a class="release-nav-extra" href="#highlights">{{ copy.nav.highlights }}</a>
          <a href="#examples">{{ copy.nav.examples }}</a>
          <RouterLink :to="`${prefix}/guide/getting-started`">
            {{ copy.nav.docs }}
          </RouterLink>
          <RouterLink :to="locale === 'zh' ? '/release/' : '/zh/release/'" :hreflang="locale === 'zh' ? 'en' : 'zh-CN'" rel="alternate">
            {{ copy.nav.locale }}
          </RouterLink>
          <ReleaseV1Appearance :label="copy.nav.appearance" />
        </nav>
      </div>
    </header>
    <main id="release-main">
      <ReleaseV1Hero :copy="copy.hero" :prefix="prefix" />
      <div class="release-soft">
        <ReleaseV1Writing :copy="copy.writing" :prefix="prefix" />
        <ReleaseV1Themes :copy="copy.themes" :prefix="prefix" />
      </div>
      <ReleaseV1Features :copy="copy.engine" :prefix="prefix" />
      <ReleaseV1Closing :copy="copy.closing" :prefix="prefix" />
    </main>
    <footer class="release-footer release-width">
      <p>© 2022–{{ new Date().getFullYear() }} Valaxy · MIT</p>
      <p>{{ copy.closing.community }}</p>
      <a href="https://github.com/YunYouJun/valaxy" target="_blank" rel="noreferrer">GitHub ↗</a>
    </footer>
  </div>
</template>

<style scoped>
.release-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--release-nav);
  border-bottom: 1px solid var(--release-line);
  backdrop-filter: blur(20px);
}

.release-nav-inner {
  max-width: 1120px;
  margin: auto;
  height: 64px;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.release-brand {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 21px;
  font-weight: 650;
  letter-spacing: -0.6px;
}

.release-brand span {
  color: var(--release-muted);
  font-weight: 400;
}

.release-brand img {
  object-fit: contain;
}

.release-links {
  display: flex;
  align-items: center;
  gap: 28px;
  font-size: 12px;
}

.release-skip {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: 30;
  padding: 12px;
  background: var(--release-bg);
  transform: translateY(-160%);
}

.release-skip:focus {
  transform: none;
}

.release-soft {
  background: var(--release-soft);
}

.release-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  padding-block: 28px;
  border-top: 1px solid var(--release-line);
  font-size: 12px;
  color: var(--release-muted);
}

@media (width <= 600px) {
  .release-nav-inner {
    height: 56px;
    padding-inline: 20px;
  }

  .release-links {
    gap: 12px;
  }

  .release-nav-extra {
    display: none;
  }

  .release-brand {
    font-size: 18px;
  }

  .release-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
