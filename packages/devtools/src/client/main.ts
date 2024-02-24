// register vue composition api globally
import { createApp } from 'vue'

// @ts-expect-error ignore vue-router/auto
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import App from './App.vue'

import '@unocss/reset/tailwind.css'
import 'uno.css'

import './styles/index.css'
import 'splitpanes/dist/splitpanes.css'

const app = createApp(App)

const router = createRouter({
  history: createWebHashHistory(),
})

app.use(router)
app.mount('#app')
