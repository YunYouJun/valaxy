/**
 * FOUC (Flash of Unstyled Content) guard — inline `<head>` snippets.
 *
 * Hides body via `opacity: 0 !important`, then removes the guard
 * `<style id="valaxy-fouc">` once the parser has finished the head and
 * its enabled stylesheets have loaded.
 *
 * @see build.foucGuard in ValaxyExtendConfig
 */

export function foucGuardHtml(maxDuration: number) {
  return [
    `<style id="valaxy-fouc">body{margin:0;opacity:0!important}</style>`,
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
  var observer = new MutationObserver(check)
  var timer = maxDuration ? setTimeout(reveal, maxDuration) : undefined

  function reveal() {
    if (done) return
    done = 1
    observer.disconnect()
    clearTimeout(timer)
    document.removeEventListener('load', check, true)
    removeEventListener('load', reveal)
    var s = document.getElementById('valaxy-fouc')
    if (s) s.remove()
  }

  function check() {
    // The parser can run this observer before it reaches the stylesheet tags.
    if (!document.body) return
    var links: NodeListOf<HTMLLinkElement> = document.head.querySelectorAll('link[rel~="stylesheet"]')
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      if (!link.disabled && !link.sheet) return
    }
    reveal()
  }

  observer.observe(document.documentElement, { childList: true })
  observer.observe(document.head, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['media', 'rel', 'disabled'],
  })

  document.addEventListener('load', check, true)
  addEventListener('load', reveal)
}
/* eslint-enable no-var, vars-on-top, antfu/if-newline */
