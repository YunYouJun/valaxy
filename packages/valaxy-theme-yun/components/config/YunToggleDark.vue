<script lang="ts" setup>
import { useAppStore } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  transition?: boolean
}>()

const appStore = useAppStore()
const { t } = useI18n()

// Use a stable default title for SSR, then update reactively on client.
const isMounted = ref(false)
onMounted(() => {
  isMounted.value = true
})
const themeTitle = computed(() => {
  if (!isMounted.value)
    return t('button.toggle_dark')
  return appStore.isDark ? t('button.toggle_light') : t('button.toggle_dark')
})

function toggle(e: MouseEvent) {
  props.transition ? appStore.toggleDarkWithTransition(e) : appStore.toggleDark()
}
</script>

<template>
  <button
    class="yun-icon-btn yun-toggle-dark"
    :title="themeTitle"
    @mousedown.prevent="() => {}"
    @click="toggle"
  >
    <div i="ri-sun-line dark:ri-moon-line" />
  </button>
</template>

<style lang="scss">
.yun-toggle-dark {
  color: #f1cb64;

  html.dark & {
    color: inherit;
  }
}
</style>
