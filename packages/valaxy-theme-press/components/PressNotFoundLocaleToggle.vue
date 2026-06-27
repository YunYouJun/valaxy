<script setup lang="ts">
export type NotFoundLocale = 'en' | 'zh'

defineProps<{
  options: { label: string, value: NotFoundLocale }[]
}>()

const model = defineModel<NotFoundLocale>({ required: true })
</script>

<template>
  <div class="not-found-locale" aria-label="404 language">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="not-found-locale-button"
      :class="{ active: model === option.value }"
      :aria-pressed="model === option.value"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.not-found-locale {
  display: inline-flex;
  flex-shrink: 0;
  padding: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg-soft) 82%, transparent);
}

.not-found-locale-button {
  min-width: 44px;
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 700;
  line-height: 30px;
  cursor: pointer;
  transition: color var(--va-transition-duration), background-color var(--va-transition-duration), box-shadow var(--va-transition-duration);
}

.not-found-locale-button.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 4px 14px rgb(0 0 0 / .08);
}
</style>
