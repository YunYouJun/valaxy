import type {} from '@devframes/service-shiki'
import type { MaybeRefOrGetter } from 'vue'
import { ref, toValue, watch } from 'vue'
import { connectionStatus, getClient } from '../rpc'

export function useCodeHighlight(code: MaybeRefOrGetter<string>, lang: MaybeRefOrGetter<string> = 'text') {
  const html = ref('')

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
      const shiki = client.services.get('@devframes/service-shiki')
      if (!shiki)
        return
      const result = await shiki.rpc.call('highlight', { code, lang })
      if (active)
        html.value = result.html
    }
    catch {
      // Highlighting is optional; the component keeps the current plain text.
    }
  }, { immediate: true })

  return html
}
