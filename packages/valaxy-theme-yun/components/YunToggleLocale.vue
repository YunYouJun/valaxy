<script lang="ts" setup>
import { isClient, useStorage } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
const { t, availableLocales, locale } = useI18n()

const lang = useStorage('valaxy-locale', locale.value)

const toggleLocales = () => {
  // change to some real logic
  const locales = availableLocales

  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
  // for localStorage
  lang.value = locale.value

  if (isClient)
    document.documentElement.setAttribute('lang', locale.value)
}
</script>

<template>
  <button class="yun-icon-btn" :title="t('button.toggle_langs')" style="color:var(--va-c-text)" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>
