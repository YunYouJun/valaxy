import { useHead } from '@unhead/vue'

/**
 * @deprecated
 */
export function useCodePen() {
  useHead({
    script: [
      {
        src: 'https://static.codepen.io/assets/embed/ei.js',
        async: true,
      },
    ],
  })
}
