<script lang="ts" setup>
import type { WalineInitOptions } from '@waline/client'
import type { WalineOptions } from '../types'
import { commentCount, init, pageviewCount } from '@waline/client'
import walineStyleUrl from '@waline/client/waline.css?url'

import { useAppStore } from 'valaxy'
import { computed, onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useRoute } from 'vue-router'
import { getEmojis } from '../utils'

const props = defineProps<{
  options: WalineOptions
}>()

const WALINE_STYLE_ATTR = 'data-valaxy-waline-style'

function ensureWalineStyle(): Promise<void> {
  if (typeof document === 'undefined' || !walineStyleUrl)
    return Promise.resolve()

  const existing = document.head.querySelector<HTMLLinkElement>(`link[${WALINE_STYLE_ATTR}]`)
  let hrefChanged = false
  if (existing) {
    if (existing.getAttribute('href') === walineStyleUrl) {
      if (existing.sheet || existing.dataset.valaxySettled === 'true')
        return Promise.resolve()
    }
    else {
      hrefChanged = true
      existing.href = walineStyleUrl
      delete existing.dataset.valaxySettled
    }
  }

  const link = existing ?? document.createElement('link')
  if (!existing) {
    link.rel = 'stylesheet'
    link.href = walineStyleUrl
    link.setAttribute(WALINE_STYLE_ATTR, '')
    // Insert before theme/site stylesheets so :root overrides keep precedence.
    const firstStyle = document.head.querySelector('link[rel="stylesheet"], style')
    document.head.insertBefore(link, firstStyle)
  }

  return new Promise<void>((resolve) => {
    const done = () => {
      link.removeEventListener('load', done)
      link.removeEventListener('error', done)
      link.dataset.valaxySettled = 'true'
      resolve()
    }
    if (!hrefChanged && link.sheet) {
      done()
      return
    }
    link.addEventListener('load', done, { once: true })
    link.addEventListener('error', done, { once: true })
  })
}

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
let unmounted = false

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

onMounted(async () => {
  const styleReady = ensureWalineStyle()
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

  await styleReady
  if (unmounted || !walineRef.value)
    return

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

onUnmounted(() => {
  unmounted = true
  walineInstance?.destroy()
})
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
