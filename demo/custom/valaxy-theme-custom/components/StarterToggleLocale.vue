<script lang="ts" setup>
import { useLocale } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const { toggleLocales } = useLocale()
</script>

<template>
  <button class="yun-icon-btn" :title="t('button.toggle_langs')" style="color:var(--va-c-text)" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>
