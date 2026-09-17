import { createPinia } from 'pinia'
// register vue composition api globally
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { handleHotUpdate, routes } from 'vue-router/auto-routes'

import App from './App.vue'

import { installI18n } from './modules/i18n'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import 'splitpanes/dist/splitpanes.css'
import '@antfu/design/styles.css'
import './styles/index.css'

import './styles/index.scss'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// This will update routes at runtime without reloading the page
if (import.meta.hot) {
  handleHotUpdate(router)
}

const pinia = createPinia()

app.use(pinia)
app.use(router)

installI18n(app)
app.mount('#app')
