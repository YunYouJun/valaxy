<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { isDark, toggleDark } from '~/composables'

const { t, availableLocales, locale } = useI18n()

const toggleLocales = () => {
  // change to some real logic
  const locales = availableLocales
  locale.value = locales[(locales.indexOf(locale.value) + 1) % locales.length]
}
</script>

<template>
  <div>
    <button class="yun-icon-btn" :title="t('button.toggle_dark')" :style="{color: isDark ? '' : '#f1cb64'}" @click="toggleDark()">
      <div i="ri-sun-line dark:ri-moon-line" />
    </button>

    <button class="yun-icon-btn" :title="t('button.toggle_langs')" style="color:var(--va-c-text)" @click="toggleLocales">
      <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
    </button>
  </div>
</template>
