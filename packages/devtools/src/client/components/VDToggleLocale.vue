<script setup lang="ts">
import dayjs from 'dayjs'
import { useI18n } from 'vue-i18n'

import { availableLocales, loadLanguageAsync } from '../modules/i18n'
import 'dayjs/locale/zh-cn'

dayjs.locale('zh-cn')

const { t, locale } = useI18n()

async function toggleLocales() {
  // change to some real logic
  const locales = availableLocales
  const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length]
  await loadLanguageAsync(newLocale)
  locale.value = newLocale

  dayjs.locale(locale.value.toLowerCase())
}
</script>

<template>
  <MenuBarBtn :title="t('button.toggle_langs')" style="color:var(--va-c-text)" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </MenuBarBtn>
</template>
