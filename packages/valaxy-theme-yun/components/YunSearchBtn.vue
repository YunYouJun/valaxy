<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

withDefaults(defineProps<{
  open?: boolean
}>(), {
  open: false,
})

const { t } = useI18n()
</script>

<template>
  <button class="yun-search-btn popup-trigger yun-icon-btn" :title="t('menu.search')">
    <div v-if="!open" i-ri-search-line />
    <div v-else text="!2xl" i-ri-close-line />
  </button>
</template>

<style lang="scss">
.yun-search-btn {
  position: fixed;
  top: 0.6rem;
  right: 0.8rem;

  color: var(--va-c-primary);
  z-index: var(--yun-z-search-btn);
}
</style>
