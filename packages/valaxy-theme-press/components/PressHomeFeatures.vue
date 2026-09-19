<script setup lang="ts">
import { useFrontmatter } from 'valaxy'

const fm = useFrontmatter()
</script>

<template>
  <section v-if="fm.features?.length" class="press-home-features">
    <div v-if="fm.featuresTitle || fm.featuresDescription" class="features-heading">
      <h2 v-if="fm.featuresTitle" class="features-title">
        {{ fm.featuresTitle }}
      </h2>
      <p v-if="fm.featuresDescription" class="features-description">
        {{ fm.featuresDescription }}
      </p>
    </div>
    <PressFeatures :features="fm.features" />
  </section>
</template>

<style scoped>
.features-heading {
  padding: 64px clamp(24px, 5vw, 72px) 48px;
}

.features-title {
  margin: 0;
  font-family: var(--pr-font-display);
  font-size: clamp(28px, 3vw, 40px);
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1.4;
  text-wrap: balance;
}

.features-description {
  margin: 16px 0 0;
  color: var(--pr-c-text-2);
  font-size: 16px;
  line-height: 1.8;
}
</style>
