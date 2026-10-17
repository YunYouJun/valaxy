<script setup lang="ts">
import type { ReleaseCopy } from '../../data/release-v1'
import ReleaseV1Type from './ReleaseV1Type.vue'

defineProps<{ copy: ReleaseCopy['writing'], prefix: string }>()
</script>

<template>
  <section id="examples" class="release-width writing-section" aria-labelledby="writing-title">
    <div class="writing-intro">
      <h2 id="writing-title" class="release-heading">
        <span v-for="line in copy.title" :key="line">{{ line }}</span>
      </h2>
      <p class="release-description">
        {{ copy.description }}
      </p>
      <RouterLink class="release-text-link" :to="`${prefix}/guide/markdown`">
        {{ copy.link }}
      </RouterLink>
    </div>
    <ReleaseV1Type :copy="copy.type" />
  </section>
</template>

<style scoped>
.writing-section {
  display: grid;
  grid-template-columns: 0.8fr 1.2fr;
  gap: 60px;
  align-items: center;
  padding-block: 120px 80px;
  font-family: Literata, "LXGW WenKai Screen", Georgia, serif;
}

.writing-section .release-heading {
  font-weight: 600;
  letter-spacing: -0.02em;
}

.writing-intro .release-text-link {
  display: inline-block;
  margin-top: 28px;
  text-decoration: underline;
  text-underline-offset: 6px;
}

@media (width <= 900px) {
  .writing-section {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
</style>
