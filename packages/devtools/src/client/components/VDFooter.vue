<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <div class="flex gap-3 justify-center">
    <a
      href="https://valaxy.site"
      target="_blank"
      class="inline-flex items-center gap-1 text-sm color-active hover:color-active transition-colors"
    >
      <div class="i-ri:book-line" />
      {{ t('footer.documentation') }}
    </a>
    <a
      href="https://github.com/YunYouJun/valaxy"
      target="_blank"
      class="inline-flex items-center gap-1 text-sm color-muted hover:color-base transition-colors"
    >
      <div class="i-ri:github-line" />
      {{ t('footer.github') }}
    </a>
  </div>
</template>
