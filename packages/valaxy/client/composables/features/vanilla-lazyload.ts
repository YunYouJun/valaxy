import { useSiteConfig } from 'valaxy'
import LazyLoad from 'vanilla-lazyload'
import { onMounted } from 'vue'

function createLazyLoadInstance(options = {}) {
  // not removeSrc in markdown-it-image-figures for vite handle relative path in src
  document.querySelectorAll('.lazy').forEach((el) => {
    const imgSrc = el.getAttribute('src')
    el.removeAttribute('src')
    el.setAttribute('data-src', imgSrc ?? '')
  })

  return new LazyLoad({
    elements_selector: '.lazy',
    ...options,
  })
}

/**
 * @see https://github.com/verlok/lazyload-es2015-webpack-test/blob/master/src/lazyload-init.js
 */
export function useVanillaLazyLoad() {
  const siteConfig = useSiteConfig()

  if (!siteConfig.value.vanillaLazyload.enable)
    return

  onMounted(() => {
    createLazyLoadInstance(siteConfig.value.vanillaLazyload)
  })
}
