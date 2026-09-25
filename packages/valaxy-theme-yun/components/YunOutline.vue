<script setup lang="ts">
import {
  useActiveAnchor,
  useOutline,
} from 'valaxy'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  select: []
}>()
const { t } = useI18n()
const containerRef = ref()
const marker = ref()

const { headers, handleClick } = useOutline()
useActiveAnchor(containerRef, marker)

function onItemClick(event: MouseEvent) {
  handleClick(event)
  emit('select')
}
</script>

<template>
  <div v-show="headers.length" ref="containerRef">
    <div class="content">
      <div class="outline-title">
        {{ t('theme.outlineTitle') }}
      </div>

      <div ref="marker" class="outline-marker" />

      <nav :aria-label="t('sidebar.toc')">
        <YunOutlineItem
          class="va-toc relative z-1 css-i18n-toc"
          :headers="headers"
          :on-click="onItemClick"
          root
        />
      </nav>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-toc {
  text-align: left;
}

.content {
  position: relative;
  padding-left: 16px;
  font-size: 14px;
  text-align: left;
}

.outline-marker {
  position: absolute;
  top: 32px;
  left: -2px;
  z-index: 0;
  opacity: 0;
  width: 4px;
  height: 18px;
  background-color: var(--va-c-brand);
  transition: top var(--va-transition-duration) cubic-bezier(0, 1, 0.5, 1), background-color var(--va-transition-duration-moderate), opacity var(--va-transition-duration);
  border-top-right-radius: 2px;
  border-bottom-right-radius: 2px;
}

.outline-title {
  letter-spacing: 0.4px;
  line-height: 28px;
  font-size: 14px;
  font-weight: 600;
}

.outline-link {
  display: block;
  line-height: 28px;
  color: var(--va-c-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--va-transition-duration-moderate);
}

.outline-link:hover,
.outline-link.active {
  color: var(--va-c-brand);
  transition: color var(--va-transition-duration);
}
</style>
