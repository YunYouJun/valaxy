/**
 * FOUC (Flash of Unstyled Content) guard — inline `<head>` snippets.
 *
 * Hides body via `opacity: 0 !important`, then removes the guard
 * `<style id="valaxy-fouc">` once all stylesheets have loaded. Uses a
 * MutationObserver to detect async stylesheet changes
 * (e.g. `media="print"` → `media="all"`).
 *
 * @see build.foucGuard in ValaxyExtendConfig
 */

export function foucGuardHtml(maxDuration: number) {
  return [
    `<style id="valaxy-fouc">body{opacity:0!important}</style>`,
    `<style>body{transition:opacity .15s ease}</style>`,
    `<noscript><style>body{opacity:1!important}</style></noscript>`,
    `<script>(${foucGuardScript.toString()})(${maxDuration})</script>`,
  ].join('')
}

/**
 * This function is serialized via `.toString()` and inlined into `<head>`.
 * It runs in the browser — do NOT reference outer-scope variables,
 * Node/TS-only APIs, or anything unavailable in a raw `<script>` context.
 */
/* eslint-disable no-var, vars-on-top, antfu/if-newline */
function foucGuardScript(maxDuration: number) {
  var done = 0

  function reveal() {
    if (done) return
    done = 1
    var s = document.getElementById('valaxy-fouc')
    if (s) s.remove()
  }

  function check() {
    var links: NodeListOf<HTMLLinkElement> = document.querySelectorAll('link[rel="stylesheet"]')
    for (var i = 0; i < links.length; i++) {
      if (!links[i].sheet) return
    }
    reveal()
  }

  new MutationObserver(check).observe(document.head, {
    childList: true,
    attributes: true,
    attributeFilter: ['media', 'rel'],
  })

  addEventListener('load', reveal)

  if (maxDuration)
    setTimeout(reveal, maxDuration)
}
/* eslint-enable no-var, vars-on-top, antfu/if-newline */
