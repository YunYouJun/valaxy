<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useLocale } from 'valaxy'

const { t, locale } = useI18n()
const { toggleLocales } = useLocale()
</script>

<template>
  <button :title="t('button.toggle_langs')" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>
