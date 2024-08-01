// register vue composition api globally
import { createApp, ref } from 'vue'

import { createRouter, createWebHashHistory } from 'vue-router/auto'
import { routes } from 'vue-router/auto-routes'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'uno.css'

import './styles/index.css'
import 'splitpanes/dist/splitpanes.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

if (import.meta.env.DEV) {
  window.__VUE_DEVTOOLS_ROUTER__ = router

  window.$frontmatter = {}
  window.$pageData = {}
  window.$valaxy = {
    postList: ref([]),
  }
}

app.use(router)
app.mount('#app')
