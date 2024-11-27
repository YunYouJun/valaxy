import type { Mermaid } from 'mermaid'
import { clearUndefined } from '@antfu/utils'
import { decode } from 'js-base64'
import { customAlphabet } from 'nanoid'
import setupMermaid from '../setup/mermaid'

const nanoid = customAlphabet('abcedfghicklmn', 10)
const cache = new Map<string, string>()

export async function renderMermaid(mermaid: Mermaid, encoded: string, options: any) {
  const key = encoded + JSON.stringify(options)
  const _cache = cache.get(key)
  if (_cache)
    return _cache

  mermaid.initialize({
    startOnLoad: false,
    ...clearUndefined(setupMermaid() || {}),
    ...clearUndefined(options),
  })
  const code = decode(encoded)
  const id = nanoid()
  const { svg } = await mermaid.render(id, code)
  cache.set(key, svg)
  return svg
}
