<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { useAppStore } from 'valaxy'

const appStore = useAppStore()
const { t } = useI18n()

const themeTitle = computed(() => {
  return appStore.isDark ? t('button.toggle_light') : t('button.toggle_dark')
})

const styles = computed(() => {
  return {
    color: appStore.isDark ? '' : '#f1cb64',
  }
})
</script>

<template>
  <div>
    <button class="yun-icon-btn" :title="themeTitle" :style="styles" @click="appStore.toggleDarkWithTransition">
      <div i="ri-sun-line dark:ri-moon-line" />
    </button>

    <YunToggleLocale />
  </div>
</template>
