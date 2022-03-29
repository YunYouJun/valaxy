import { useHead } from '@vueuse/head'

/**
 * use katex css cdn
 */
export function useKatex() {
  useHead({
    link: [
      {
        rel: 'stylesheet',
        href: 'https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css',
      },
    ],
  })
}
