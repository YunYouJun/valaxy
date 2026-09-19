<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineProps<{
  theme: 'brand' | 'alt'
  link: string
  text: string
}>()

const { t } = useI18n()
</script>

<template>
  <AppLink :to="link" class="press-button" :class="`is-${theme}`">
    <slot>{{ t(text) }}</slot>
  </AppLink>
</template>

<style scoped>
.press-button {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 46px;
  padding: 10px 20px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  line-height: 24px;
  text-decoration: none;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
}

.is-brand {
  color: #fff;
  background: var(--pr-button-brand-bg);
  border-color: transparent;
  box-shadow: 0 3px 8px rgb(77 65 169 / 0.12);
}

.is-brand:hover {
  box-shadow: 0 4px 20px rgb(100 77 214 / 0.28);
}

.is-alt {
  color: var(--pr-c-text-1);
  background: var(--pr-c-bg);
}

.is-alt:hover {
  background: var(--pr-c-surface);
  border-color: var(--pr-c-text-2);
}

@media (prefers-reduced-motion: reduce) {
  .press-button { transition: none; }
}
</style>
