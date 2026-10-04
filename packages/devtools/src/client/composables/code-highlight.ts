import type { MaybeRefOrGetter } from 'vue'
import { shallowRef, toValue, watch } from 'vue'
import { connectionStatus, getClient } from '../rpc'

export function useCodeHighlight(code: MaybeRefOrGetter<string>, lang: MaybeRefOrGetter<string> = 'text') {
  const html = shallowRef('')

  watch([() => toValue(code), () => toValue(lang), connectionStatus], async ([code, lang, status], _, onCleanup) => {
    // Never show the previous page's code while a fresh highlight is pending.
    html.value = ''
    let active = true
    onCleanup(() => {
      active = false
    })
    if (!code || status !== 'connected')
      return

    try {
      const client = await getClient()
      if (!active)
        return
      const result = await client.call('valaxy:service:shiki:highlight', { code, lang })
      if (active)
        html.value = result.html
    }
    catch {
      // Highlighting is optional; the component keeps the current plain text.
    }
  }, { immediate: true })

  return html
}
