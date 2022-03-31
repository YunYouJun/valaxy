import { useHead } from '@vueuse/head'

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
