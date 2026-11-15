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

function matchesStyleHref(link: HTMLLinkElement, url: string, resolvedUrl?: string): boolean {
  if (link.getAttribute('href') === url)
    return true
  return resolvedUrl ? link.href === resolvedUrl : false
}

function positionBeforeSiteStyles(link: HTMLLinkElement): void {
  const firstStyle = document.head.querySelector('link[rel="stylesheet"], style')
  const isAfterFirstStyle = Boolean(
    firstStyle
    && firstStyle !== link
    && (firstStyle.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING),
  )
  if (!link.isConnected || isAfterFirstStyle)
    document.head.insertBefore(link, firstStyle)
}

function ensureWalineStyle(): Promise<void> {
  if (typeof document === 'undefined' || !walineStyleUrl)
    return Promise.resolve()

  let resolvedUrl: string | undefined
  try {
    resolvedUrl = new URL(walineStyleUrl, document.baseURI).href
  }
  catch {}

  const existing = document.head.querySelector<HTMLLinkElement>(`link[${WALINE_STYLE_ATTR}]`)
    ?? Array.from(document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))
      .find(candidate => matchesStyleHref(candidate, walineStyleUrl, resolvedUrl))

  const link = existing ?? document.createElement('link')
  const hrefChanged = Boolean(existing) && !matchesStyleHref(link, walineStyleUrl, resolvedUrl)

  if (!existing) {
    link.rel = 'stylesheet'
    link.href = walineStyleUrl
  }
  else if (hrefChanged) {
    link.href = walineStyleUrl
    delete link.dataset.valaxySettled
  }

  link.setAttribute(WALINE_STYLE_ATTR, '')
  // Insert or move before theme/site stylesheets so :root overrides keep precedence,
  // including when SSG preload links already emitted this stylesheet after theme CSS.
  positionBeforeSiteStyles(link)

  if (!hrefChanged && (link.sheet || link.dataset.valaxySettled === 'true'))
    return Promise.resolve()

  return new Promise<void>((resolve) => {
    const done = () => {
      link.removeEventListener('load', done)
      link.removeEventListener('error', done)
      link.dataset.valaxySettled = 'true'
      resolve()
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
