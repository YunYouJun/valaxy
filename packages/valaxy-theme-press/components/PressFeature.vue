<script setup lang="ts">
import type { Feature } from '../types'
import { useI18n } from 'vue-i18n'

defineProps<{
  feature: Feature
}>()

const { t } = useI18n()
</script>

<template>
  <article class="press-feature">
    <div v-if="feature.icon" class="icon">
      <template v-if="feature.icon.startsWith('i-')">
        <div :class="feature.icon" />
      </template>
      <template v-else>
        {{ feature.icon }}
      </template>
    </div>
    <h2 class="title">
      {{ t(feature.title) }}
    </h2>
    <p class="details">
      {{ t(feature.details) }}
    </p>
  </article>
</template>

<style scoped>
.press-feature {
  border: 1px solid var(--va-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  background-color: var(--va-c-bg-soft);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--vp-c-default-soft);
  width: 48px;
  height: 48px;
  font-size: 24px;
  transition: background-color 0.25s;
}

.dark .icon {
  background-color: var(--va-c-bg);
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.details {
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--va-c-text-lighter);
}
</style>
