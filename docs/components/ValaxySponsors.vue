<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const copy = computed(() => route.path.startsWith('/zh/')
  ? {
      eyebrow: '赞助者',
      title: '感谢每一位赞助者',
      description: 'Valaxy 免费且开源，你们的支持让它持续前行。',
      cta: '成为赞助者',
      expand: '查看全部赞助者',
      collapse: '收起',
    }
  : {
      eyebrow: 'SPONSORS',
      title: 'Made possible by our sponsors',
      description: 'Valaxy is free and open source. Your support keeps it moving.',
      cta: 'Become a sponsor',
      expand: 'Show all sponsors',
      collapse: 'Show less',
    })

const expanded = shallowRef(false)
</script>

<template>
  <section class="home-sponsors" aria-labelledby="home-sponsors-title">
    <div class="sponsors-heading press-reveal">
      <div>
        <p class="sponsors-eyebrow">
          {{ copy.eyebrow }}
        </p>
        <h2 id="home-sponsors-title" class="sponsors-title">
          {{ copy.title }}
        </h2>
        <p class="sponsors-description">
          {{ copy.description }}
        </p>
      </div>
      <a class="sponsors-cta" href="https://www.yunyoujun.cn/sponsors/" target="_blank" rel="noopener">
        {{ copy.cta }} <span aria-hidden="true">↗</span>
      </a>
    </div>

    <div id="home-sponsors-list" class="sponsors-list" :class="{ 'is-expanded': expanded }">
      <a href="https://www.yunyoujun.cn/sponsors/" target="_blank" rel="noopener">
        <img
          src="https://sponsors.yunyoujun.cn/sponsors.svg"
          alt="YunYouJun's Sponsors"
          width="710"
          height="579"
          loading="lazy"
          decoding="async"
        >
      </a>
    </div>
    <div class="sponsors-toggle-row">
      <button
        type="button"
        class="sponsors-toggle"
        aria-controls="home-sponsors-list"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? copy.collapse : copy.expand }}
        <span class="toggle-icon" aria-hidden="true">↓</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.home-sponsors {
  padding: 64px clamp(24px, 5vw, 72px) 40px;
}

.sponsors-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px 32px;
  margin-bottom: 40px;
}

.sponsors-eyebrow {
  margin: 0 0 24px;
  color: var(--pr-c-brand, var(--va-c-primary));
  font: 12px var(--pr-font-mono, var(--va-font-mono));
  letter-spacing: 0.12em;
}

.sponsors-title {
  margin: 0;
  padding: 0;
  border: 0;
  font-family: var(--pr-font-display, var(--va-font-sans));
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.4;
}

.sponsors-description {
  margin: 16px 0 0;
  color: var(--pr-c-text-2);
  font-size: 15px;
  line-height: 1.85;
  text-wrap: pretty;
}

.sponsors-cta {
  display: inline-flex;
  gap: 10px;
  padding-block: 10px;
  color: var(--pr-c-brand, var(--va-c-primary));
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.sponsors-cta:hover {
  text-decoration: underline;
}

.sponsors-list {
  position: relative;
  max-height: 340px;
  overflow: hidden;
  mask-image: linear-gradient(#000 70%, transparent);
}

.sponsors-list.is-expanded {
  max-height: none;
  mask-image: none;
}

.sponsors-list img {
  display: block;
  width: 100%;
  max-width: 710px;
  height: auto;
  margin-inline: auto;
}

.sponsors-toggle-row {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.sponsors-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 999px;
  color: var(--pr-c-text-2);
  background: var(--pr-c-bg);
  font-size: 13px;
  transition:
    color var(--va-transition-duration),
    border-color var(--va-transition-duration);
}

.sponsors-toggle:hover {
  color: var(--pr-c-brand, var(--va-c-primary));
  border-color: currentcolor;
}

.toggle-icon {
  transition: transform var(--va-transition-duration) var(--pr-ease-out);
}

.sponsors-toggle[aria-expanded='true'] .toggle-icon {
  transform: rotate(180deg);
}

/* On phones the scaled-down list already fits, so show it whole. */
@media (width <= 639px) {
  .sponsors-list {
    max-height: none;
    mask-image: none;
  }

  .sponsors-toggle-row {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sponsors-toggle,
  .toggle-icon {
    transition: none;
  }
}
</style>
