<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { useI18n } from 'vue-i18n'

const fm = useFrontmatter()
const { t } = useI18n()
</script>

<template>
  <div class="ai-generated-excerpt">
    <div class="ai-generated-excerpt-header">
      <span class="ai-generated-excerpt-icon i-ri-robot-2-line" aria-hidden="true" />
      <span>{{ t('excerpt.ai') }}</span>
    </div>
    <div class="ai-generated-excerpt-body">
      {{ fm.excerpt }}
    </div>
  </div>
</template>

<style lang="scss">
.ai-generated-excerpt {
  margin-bottom: 1.25rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: var(--va-card-border-radius, 0.5rem);
  background-color: var(--va-c-bg-alt);
}

.ai-generated-excerpt-header {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--va-c-text);
  font-size: 0.875rem;
  font-weight: 700;
}

.ai-generated-excerpt-icon {
  font-size: 1rem;
  color: var(--va-c-link);
}

.ai-generated-excerpt-body {
  margin-top: 0.375rem;
  color: var(--va-c-text-2);
  font-size: 0.9rem;
  line-height: 1.65;
}
</style>
