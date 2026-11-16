import type { ComputedRef } from 'vue'
import type { TwikooOptions } from '../types'
import { isClient } from '@vueuse/core'
import { useSiteConfig } from 'valaxy'
import {
  computed,
  getCurrentInstance,
  getCurrentScope,
  nextTick,
  onMounted,
  onScopeDispose,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useAddonTwikoo } from './options'

declare global {
  interface Window {
  // extend the window
    twikoo: {
      init: (options: {
        envId: string
        el: string
      } | any) => any
    }
  }
}

/**
 * A simple, safe, free comment system.
 * @public
 * @see https://github.com/imaegoo/twikoo
 * @see https://twikoo.js.org/
 * @param options
 */
export function useTwikoo(options: ComputedRef<TwikooOptions | undefined>, version = 'latest') {
  const siteConfig = useSiteConfig()
  const cdnPrefix = computed(() => siteConfig.value.cdn.prefix)
  const scriptSrc = computed(() => `${cdnPrefix.value}twikoo@${version}/dist/twikoo.all.min.js`)

  const route = useRoute()
  const { locale } = useI18n()

  const hasInstance = !!getCurrentInstance()
  const isMounted = ref(!hasInstance)
  let disposed = false
  let scriptLoaded = false

  /**
   * init twikoo
   */
  async function initTwikoo(twikooOptions: TwikooOptions) {
    if (!isClient || disposed || !isMounted.value)
      return

    const resolvedOptions = {
      ...twikooOptions,
      el: twikooOptions.el ?? '.comment #tcomment',
      lang: twikooOptions.lang ?? locale.value,
      path: twikooOptions.path ?? route.path,
    }

    await nextTick()
    if (!isClient || disposed || !isMounted.value || typeof window.twikoo?.init !== 'function')
      return

    const targetEl = typeof resolvedOptions.el === 'string'
      ? document.querySelector(resolvedOptions.el)
      : resolvedOptions.el
    if (!targetEl)
      return

    return window.twikoo.init(resolvedOptions)
  }

  const cleanupLifecycle = () => {
    disposed = true
    isMounted.value = false
    scriptLoaded = false
  }

  if (hasInstance) {
    onMounted(() => {
      if (!disposed)
        isMounted.value = true
    })
    onUnmounted(cleanupLifecycle)
  }
  else if (getCurrentScope()) {
    onScopeDispose(cleanupLifecycle)
  }

  watch(
    [isMounted, scriptSrc],
    ([mounted, src], _prev, onCleanup) => {
      if (!isClient || !mounted || disposed)
        return

      let cancelled = false
      scriptLoaded = false

      const existing = [...document.scripts].find(s => s.getAttribute('src') === src)
      if (existing && typeof window.twikoo?.init === 'function') {
        scriptLoaded = true
        if (options.value)
          void initTwikoo(options.value)
        onCleanup(() => {
          cancelled = true
          scriptLoaded = false
        })
        return
      }

      const script = existing ?? document.createElement('script')
      const createdByUs = !existing
      if (createdByUs) {
        script.src = src
        script.async = true
      }

      const onLoad = () => {
        if (cancelled || disposed || !isMounted.value)
          return
        scriptLoaded = true
        if (options.value)
          void initTwikoo(options.value)
      }

      const onError = () => {
        scriptLoaded = false
      }

      script.addEventListener('load', onLoad)
      script.addEventListener('error', onError)

      if (createdByUs)
        document.head.append(script)

      onCleanup(() => {
        cancelled = true
        scriptLoaded = false
        script.removeEventListener('load', onLoad)
        script.removeEventListener('error', onError)
        if (createdByUs)
          script.remove()
      })
    },
    { immediate: true },
  )

  watch(
    [() => route.path, locale, options],
    () => {
      if (!isClient || disposed || !isMounted.value || !scriptLoaded || !options.value)
        return
      void initTwikoo(options.value)
    },
    { deep: true },
  )
}

export function useTwikooWithOptions(version = 'latest') {
  const addonTwikoo = useAddonTwikoo()
  const options = computed(() => addonTwikoo.value?.options)
  useTwikoo(options, version)
}
