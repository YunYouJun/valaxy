<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { isDark, toggleDark } from '~/composables'

const { t } = useI18n()
</script>

<template>
  <div>
    <button class="yun-icon-btn" :title="t('button.toggle_dark')" :style="{ color: isDark ? '' : '#f1cb64' }" @click="toggleDark()">
      <div i="ri-sun-line dark:ri-moon-line" />
    </button>

    <YunToggleLocale />
  </div>
</template>
