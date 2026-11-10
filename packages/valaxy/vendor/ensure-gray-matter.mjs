import * as nodeModule from 'node:module'
import { resolve } from './redirect-gray-matter.mjs'

let pending

/**
 * Install the gray-matter redirect before markdown plugins are imported.
 * `registerHooks` runs in-process and is the supported API on Node >=22.15.
 * Older 22.12–22.14 releases only have the off-thread `module.register()`.
 */
export function ensureGrayMatterRedirect() {
  if (!pending)
    pending = install()
  return pending
}

function install() {
  if (typeof nodeModule.registerHooks === 'function') {
    nodeModule.registerHooks({ resolve })
    return Promise.resolve()
  }
  return nodeModule.register(new URL('./redirect-gray-matter.mjs', import.meta.url), import.meta.url)
}
