<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useYunCollection } from '../../composables/collection'

const { collection } = useYunCollection()
const { t } = useI18n()
</script>

<template>
  <details v-if="collection" :key="collection.key" class="yun-collection-mobile">
    <summary class="collection-toggle">
      <span class="i-ri-list-check collection-icon" aria-hidden="true" />
      <span class="collection-heading">
        <span class="collection-label">{{ t('theme.collectionContents') }}</span>
        <span class="collection-name" :title="collection.title || collection.name || collection.key">
          {{ collection.title || collection.name || collection.key }}
        </span>
      </span>
      <span class="i-ri-arrow-down-s-line collection-chevron" aria-hidden="true" />
    </summary>
    <div class="collection-panel">
      <YunCollectionSidebar />
    </div>
  </details>
</template>

<style scoped>
.yun-collection-mobile {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  max-width: calc(100% - 48px);
  margin: 16px 24px;
  border: 1px solid var(--va-c-divider);
  border-radius: 12px;
  background: var(--va-c-bg-light);
  text-align: start;
}

.collection-toggle {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: 64px;
  padding: 10px 16px;
  border-radius: 12px;
  list-style: none;
  cursor: pointer;
}

.collection-toggle::-webkit-details-marker {
  display: none;
}

.collection-icon,
.collection-chevron {
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  color: var(--va-c-primary);
}

.collection-heading {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: 2px;
}

.collection-label {
  color: var(--va-c-text-2);
  font-size: 12px;
  line-height: 18px;
}

.collection-name {
  overflow: hidden;
  color: var(--va-c-text);
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collection-chevron {
  color: var(--va-c-text-2);
  transition: transform 150ms ease;
}

.yun-collection-mobile[open] .collection-chevron {
  transform: rotate(180deg);
}

.collection-panel {
  max-height: min(50dvh, 24rem);
  overflow: auto;
  overscroll-behavior: contain;
  border-top: 1px solid var(--va-c-divider);
  border-radius: 0 0 12px 12px;
}

.collection-panel :deep(.yun-collection-sidebar) {
  min-height: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.collection-toggle:focus-visible {
  outline: 2px solid var(--va-c-primary);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .collection-chevron {
    transition: none;
  }
}

@media (width >= 1024px) {
  .yun-collection-mobile {
    display: none;
  }
}
</style>
