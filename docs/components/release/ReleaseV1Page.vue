<script setup lang="ts">
import type { ReleaseLocale } from '../../data/release-v1'
import { computed } from 'vue'
import { releaseCopies } from '../../data/release-v1'
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
.release-skip {
  position: fixed;
  top: 8px;
  left: 8px;
  z-index: calc(var(--pr-z-nav) + 1);
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
  .release-footer {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
