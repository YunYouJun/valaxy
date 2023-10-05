<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import { useEditLink } from '../composables'

const editLink = useEditLink()

const { t } = useI18n()
</script>

<template>
  <div flex justify="between" text="sm">
    <a flex items="center" :href="editLink.url" target="_blank">
      <div i-ri-external-link-line />
      <span ml-1>{{ editLink.text || t('tooltip.edit_this_page') }}</span>
    </a>
    <PressDocFooterLastUpdated />
  </div>
</template>
