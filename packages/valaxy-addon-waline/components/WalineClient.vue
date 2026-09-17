<script lang="ts" setup>
import type { WalineInitOptions } from '@waline/client'
import type { WalineOptions } from '../types'
import { commentCount, init, pageviewCount } from '@waline/client'
import { useAppStore } from 'valaxy'

import { computed, onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

import { getEmojis } from '../utils'
import '@waline/client/style'

const props = defineProps<{
  options: WalineOptions
}>()

const appStore = useAppStore()

const route = useRoute()
const { locale } = useI18n()
const path = computed(() => props.options.path || route.path.replace(/\/$/, ''))
type WalineEmoji = Exclude<WalineInitOptions['emoji'], boolean | undefined>

const emoji = computed<WalineEmoji>(() => getEmojis(
  props.options.cdn,
  props.options.types,
  props.options.emoji,
) as WalineEmoji)
const walineRef = useTemplateRef<HTMLElement>('waline')
let walineInstance: ReturnType<typeof init> | undefined

function getWalineOptions() {
  const {
    cdn: _cdn,
    types: _types,
    comment: _comment,
    pageview: _pageview,
    ...options
  } = props.options
  return {
    ...options,
    path: path.value,
    lang: locale.value,
    dark: appStore.isDark,
    emoji: emoji.value,
  }
}

onMounted(() => {
  const { pageview, comment } = props.options

  if (pageview) {
    pageviewCount({
      serverURL: props.options.serverURL,
      path: path.value,
      selector: typeof pageview === 'string' ? pageview : undefined,
    })
  }

  if (comment) {
    commentCount({
      serverURL: props.options.serverURL,
      path: path.value,
      selector: typeof comment === 'string' ? comment : undefined,
    })
  }

  walineInstance = init({
    ...getWalineOptions(),
    el: walineRef.value,
  })
})

watch(
  [() => props.options, path, locale, () => appStore.isDark, emoji],
  () => walineInstance?.update(getWalineOptions()),
  { deep: true },
)

onUnmounted(() => walineInstance?.destroy())
</script>

<template>
  <div ref="waline" />
</template>

<style>
:root {
  --waline-theme-color: var(--va-c-primary);
  --waline-active-color: var(--va-c-primary-light);
}
</style>
