<script lang="ts" setup>
import { useLocale } from 'valaxy'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const { toggleLocales } = useLocale()
</script>

<template>
  <button :title="locale" @click="toggleLocales">
    <div i-ri-translate class="transition transform" :class="locale === 'en' ? 'rotate-y-180' : ''" />
  </button>
</template>
