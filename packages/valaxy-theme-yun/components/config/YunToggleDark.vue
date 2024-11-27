<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  transition?: boolean
}>()

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

function toggle(e: MouseEvent) {
  props.transition ? appStore.toggleDarkWithTransition(e) : appStore.toggleDark()
}
</script>

<template>
  <button
    class="yun-icon-btn"
    :title="themeTitle"
    :style="styles"
    @mousedown.prevent="() => {}"
    @click="toggle"
  >
    <div i="ri-sun-line dark:ri-moon-line" />
  </button>
</template>
