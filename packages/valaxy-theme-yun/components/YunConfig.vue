<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { isDark, toggleDark } from 'valaxy'

const { t } = useI18n()

const themeTitle = computed(() => {
  return isDark.value ? t('button.toggle_light') : t('button.toggle_dark')
})
</script>

<template>
  <div>
    <button class="yun-icon-btn" :title="themeTitle" :style="{ color: isDark ? '' : '#f1cb64' }" @click="toggleDark()">
      <div i="ri-sun-line dark:ri-moon-line" />
    </button>

    <YunToggleLocale />
  </div>
</template>
