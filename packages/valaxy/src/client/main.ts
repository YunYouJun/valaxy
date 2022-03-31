import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'

import '@unocss/reset/tailwind.css'

// markdown css
import 'star-markdown-css/src/scss/theme/yun.scss'

import './styles/css-vars/index.scss'
import './styles/css-vars/light.scss'
import './styles/css-vars/dark.scss'
import './styles/index.scss'

import '/@valaxyjs/styles'

import 'uno.css'

const routes = setupLayouts(generatedRoutes)

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.globEager('./modules/*.ts')).forEach(i => i.install?.(ctx))
  },
)
