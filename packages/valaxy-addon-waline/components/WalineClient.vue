<script lang="ts" setup>
import { isDark } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
// @ts-expect-error vue waline component type
import { Waline } from '@waline/client/dist/component'
import { getEmojis } from '../utils'

import '@waline/client/dist/waline.css'

const props = defineProps<{
  serverURL: string
  cdn: string
}>()

const { locale } = useI18n()
const emoji = computed(() => getEmojis(props.cdn))
const route = useRoute()
const path = computed(() => route.path)
</script>

<template>
  <Waline :server-u-r-l="serverURL" :lang="locale" :path="path" :dark="isDark" :emoji="emoji" />
</template>

<style>
:root {
  --waline-theme-color: var(--va-c-primary);
  --waline-active-color: var(--va-c-primary-light);
}
</style>
