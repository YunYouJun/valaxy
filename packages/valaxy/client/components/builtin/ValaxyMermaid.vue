<!--
Mermaid
(auto transformed, you don't need to use this component directly)

Usage:

```mermaid
pie
"Dogs" : 386
"Cats" : 85
"Rats" : 15
```
-->

<script setup lang="ts">
import { isClient } from '@vueuse/core'

import { useAppStore } from 'valaxy'
import { getCurrentInstance, ref, watch, watchEffect } from 'vue'
import { renderMermaid } from '../../modules/mermaid'
import ShadowRoot from '../internals/ShadowRoot.vue'

const props = defineProps<{
  code: string
  scale?: number
  theme?: string
}>()

const vm = getCurrentInstance()
const el = ref<ShadowRoot>()
const html = ref('')

const appStore = useAppStore()

if (isClient) {
  // dynamic import to reduce initial bundle size
  import('mermaid').then(m => m.default).then((mermaid) => {
    mermaid.startOnLoad = false
    mermaid.initialize({ startOnLoad: false })

    watchEffect(async (onCleanup) => {
      let disposed = false
      onCleanup(() => {
        disposed = true
      })
      const svg = await renderMermaid(
        mermaid,
        props.code || '',
        {
          theme: props.theme || (appStore.isDark ? 'dark' : undefined),
          ...vm!.attrs,
        },
      )
      if (!disposed)
        html.value = svg
    })

    const actualHeight = ref<number>()

    watch(html, () => {
      actualHeight.value = undefined
    })

    watchEffect(() => {
      const svgEl = el.value?.children?.[0] as SVGElement | undefined
      if (svgEl && svgEl.hasAttribute('viewBox') && actualHeight.value == null) {
        const v = Number.parseFloat(svgEl.getAttribute('viewBox')?.split(' ')[3] || '')
        actualHeight.value = Number.isNaN(v) ? undefined : v
      }
    }, { flush: 'post' })

    watchEffect(() => {
      const svgEl = el.value?.children?.[0] as SVGElement | undefined
      if (svgEl != null && props.scale != null && actualHeight.value != null) {
        svgEl.setAttribute('height', `${actualHeight.value * props.scale}`)
        svgEl.removeAttribute('width')
        svgEl.removeAttribute('style')
      }
    }, { flush: 'post' })
  })
}
</script>

<template>
  <ShadowRoot class="mermaid" :inner-html="html" @shadow="el = $event" />
</template>
