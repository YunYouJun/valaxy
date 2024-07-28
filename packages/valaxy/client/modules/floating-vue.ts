import FloatingVue from 'floating-vue'
import type { ViteSSGContext } from 'vite-ssg'

import 'floating-vue/dist/style.css'

export async function install({ app }: ViteSSGContext) {
  app.use(FloatingVue)
}
