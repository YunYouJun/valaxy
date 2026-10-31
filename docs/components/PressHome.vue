<script setup lang="ts">
import ThemePressHome from 'valaxy-theme-press/components/PressHome.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeAiThemes from './home/HomeAiThemes.vue'
import HomeDevtools from './home/HomeDevtools.vue'
import HomeEcosystem from './home/HomeEcosystem.vue'
import ValaxySponsors from './ValaxySponsors.vue'

const route = useRoute()
const lang = computed(() => route.path === '/zh' || route.path.startsWith('/zh/') ? 'zh' : 'en')
const choose = computed(() => lang.value === 'zh'
  ? {
      href: '/zh/guide/choose',
      link: '静态博客框架怎么选',
      rest: '：Valaxy、Hexo、VitePress、Hugo、Astro 对比。',
    }
  : {
      href: '/guide/choose',
      link: 'How to choose a static blog framework',
      rest: ': Valaxy, Hexo, VitePress, Hugo, and Astro.',
    })
</script>

<template>
  <ThemePressHome>
    <template #home-hero-after>
      <p class="home-choose">
        <RouterLink :to="choose.href">
          {{ choose.link }}
        </RouterLink>{{ choose.rest }}
      </p>
    </template>
    <template #home-features-after>
      <HomeEcosystem :lang="lang" />
      <HomeDevtools :lang="lang" />
      <HomeAiThemes :lang="lang" />
      <ValaxySponsors />
    </template>
  </ThemePressHome>
</template>

<style scoped>
.home-choose {
  margin: 0;
  padding: 22px clamp(32px, 5vw, 72px);
  border-bottom: 1px solid var(--pr-c-divider-light);
  color: var(--pr-c-text-2);
  font-size: 15px;
  line-height: 1.7;
}

.home-choose a {
  color: var(--pr-c-brand);
  font-weight: 600;
  text-decoration: none;
}

.home-choose a:hover {
  text-decoration: underline;
}

.home-choose a:focus-visible {
  outline: 2px solid var(--pr-c-brand);
  outline-offset: 4px;
}

@media (width <= 639px) {
  .home-choose {
    padding: 18px 24px;
  }
}
</style>
