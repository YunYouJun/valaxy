<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'

defineProps<{ copy: ReleaseCopy['engine'], prefix: string }>()
const stages = ['Markdown', 'Vue SSR', 'HTML']
</script>

<template>
  <section id="highlights" class="engine-section" aria-labelledby="engine-title">
    <div class="release-width">
      <div class="engine-top release-reveal">
        <div>
          <h2 id="engine-title" class="release-heading">
            <span v-for="line in copy.title" :key="line">{{ line }}</span>
          </h2><p class="release-description">
            {{ copy.description }}
          </p>
        </div>
        <ol class="engine-pipeline">
          <li v-for="(stage, index) in stages" :key="stage">
            <span class="pipeline-symbol" :class="{ 'vue-symbol': index === 1 }" aria-hidden="true">{{ ['↓', 'V', '⟨/⟩'][index] }}</span>
            <strong>{{ stage }}</strong><span>{{ copy.pipeline[index] }}</span>
          </li>
        </ol>
      </div>
      <div class="engine-features release-reveal">
        <article v-for="feature in copy.features" :key="feature.title">
          <h3>{{ feature.title }}</h3><p>{{ feature.text }}</p><RouterLink :to="`${prefix}${feature.href}`">
            {{ feature.action }} ›
          </RouterLink>
        </article>
      </div>
      <div class="engine-addons release-reveal">
        <div>
          <h3>{{ copy.addonsTitle }}</h3><p>{{ copy.addonsText }}</p><RouterLink :to="`${prefix}/addons/official`">
            {{ copy.addonsAction }} ›
          </RouterLink>
        </div>
        <div class="addon-names" aria-label="Addons">
          <span>Waline</span><span>Algolia</span><span>LightGallery</span><span>Meting</span><span>Moments</span>
        </div>
      </div>
      <div class="engine-migration">
        <RouterLink :to="`${prefix}/migration/version#${prefix ? 'v100' : 'v1-0-0'}`">
          {{ copy.migration }} ↗
        </RouterLink><p>{{ copy.requirements }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.engine-section {
  padding-block: 120px 60px;
  background: #101012;
  color: #f5f5f7;
}

.engine-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
}

.engine-top .release-description {
  color: #a1a1a6;
  max-width: 480px;
}

.engine-pipeline {
  display: flex;
  list-style: none;
  justify-content: space-between;
  padding: 0;
  gap: 28px;
}

.engine-pipeline li {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  position: relative;
}

.engine-pipeline li:not(:last-child)::after {
  content: '→';
  position: absolute;
  left: calc(100% + 10px);
  top: 32px;
  color: #737379;
}

.pipeline-symbol {
  height: 80px;
  display: grid;
  place-items: center;
  font-size: 55px;
  font-weight: 300;
  color: #b5b5be;
}

.pipeline-symbol.vue-symbol {
  color: #42b883;
  font-weight: 800;
}

.engine-pipeline strong {
  font-size: 16px;
}

.engine-pipeline li > span:last-child {
  font-size: 12px;
  color: #a1a1a6;
}

.engine-features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 36px;
  margin-top: 72px;
  padding-top: 36px;
  border-top: 1px solid #353538;
}

.engine-features article + article {
  border-left: 1px solid #353538;
  padding-left: 36px;
}

.engine-section h3 {
  font-size: 22px;
  letter-spacing: -0.5px;
  font-weight: 600;
}

.engine-features p, .engine-addons p {
  font-size: 14px;
  line-height: 1.9;
  color: #a1a1a6;
  margin-top: 16px;
}

.engine-section a {
  color: #74b6fb;
  font-size: 13px;
  display: inline-block;
  margin-top: 24px;
}

.engine-addons {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 80px;
  border-top: 1px solid #353538;
  margin-top: 64px;
  padding-top: 40px;
}

.addon-names {
  display: flex;
  flex-wrap: wrap;
  gap: 14px 24px;
  font-size: 22px;
  font-weight: 550;
  color: #c9c9d0;
}

.addon-names span:nth-child(2n) {
  color: #898993;
}

.engine-migration {
  text-align: center;
  padding-top: 50px;
}

.engine-migration p {
  font-size: 11px;
  color: #a1a1a6;
  margin-top: 16px;
  line-height: 1.8;
}

@media (width <= 900px) {
  .engine-top {
    grid-template-columns: 1fr;
    gap: 45px;
  }

  .engine-pipeline {
    max-width: 560px;
  }

  .engine-features {
    gap: 20px;
  }

  .engine-features article + article {
    padding-left: 20px;
  }

  .engine-addons {
    gap: 30px;
  }
}

@media (width <= 600px) {
  .engine-section {
    padding-block: 80px 50px;
  }

  .engine-features {
    grid-template-columns: 1fr;
    gap: 30px;
    margin-top: 48px;
  }

  .engine-features article + article {
    padding: 30px 0 0;
    border-left: 0;
    border-top: 1px solid #353538;
  }

  .engine-pipeline strong {
    font-size: 14px;
  }

  .engine-pipeline {
    gap: 20px;
  }

  .engine-pipeline li:not(:last-child)::after {
    left: calc(100% + 5px);
  }

  .engine-pipeline li > span:last-child {
    font-size: 10px;
  }

  .engine-addons {
    grid-template-columns: 1fr;
  }

  .addon-names {
    font-size: 19px;
  }
}
</style>
