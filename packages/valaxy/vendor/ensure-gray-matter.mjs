import { register } from 'node:module'

let pending

/** Install the gray-matter redirect before markdown plugins are imported. */
export function ensureGrayMatterRedirect() {
  if (!pending)
    pending = register(new URL('./redirect-gray-matter.mjs', import.meta.url), import.meta.url)
  return pending
}
