<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex gap-3 justify-center">
    <a
      href="https://valaxy.site"
      target="_blank"
      class="inline-flex items-center gap-1 text-sm text-indigo-500 hover:text-indigo-600 transition-colors"
    >
      <div class="i-ri:book-line" />
      {{ t('footer.documentation') }}
    </a>
    <a
      href="https://github.com/YunYouJun/valaxy"
      target="_blank"
      class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
    >
      <div class="i-ri:github-line" />
      {{ t('footer.github') }}
    </a>
  </div>
</template>
