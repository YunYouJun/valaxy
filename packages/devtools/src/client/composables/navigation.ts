import type { DevToolsDockEntry } from '@vitejs/devtools-kit'
import type { DevToolsFrameTab } from '@vitejs/devtools-kit/client'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { DEVTOOLS_FRAME_ID } from '../../shared/constants'
import { connectionError, connectionStatus, getClient } from '../rpc'
import { extensions } from '../stores/app'

// @unocss-include
const pages = [
  { id: 'dashboard', path: '/', icon: 'i-ph:squares-four', label: 'nav.dashboard' },
  { id: 'posts', path: '/posts', icon: 'i-ph:article', label: 'nav.posts' },
  { id: 'archives', path: '/archives', icon: 'i-ph:archive', label: 'nav.archives' },
  { id: 'categories', path: '/categories', icon: 'i-ph:folders', label: 'nav.categories' },
  { id: 'tags', path: '/tags', icon: 'i-ph:hash', label: 'nav.tags' },
  { id: 'collections', path: '/collections', icon: 'i-ph:books', label: 'nav.collections' },
  { id: 'batch-edit', path: '/batch-edit', icon: 'i-ph:pencil-simple', label: 'nav.batch_edit' },
  { id: 'config', path: '/config', icon: 'i-ph:sliders-horizontal', label: 'nav.config' },
  { id: 'debug', path: '/debug', icon: 'i-ph:bug', label: 'nav.debug' },
  { id: 'addons', path: '/addons', icon: 'i-ph:puzzle-piece', label: 'extensions.title' },
  { id: 'settings', path: '/settings', icon: 'i-ph:gear-six', label: 'nav.settings' },
] as const

export const usesHostNavigation = ref(false)

export function useHostNavigation() {
  watch(connectionStatus, async (status, _previous, onCleanup) => {
    let disposed = false
    let unsubscribe: (() => void) | undefined
    onCleanup(() => {
      disposed = true
      unsubscribe?.()
    })
    if (window.parent === window || status !== 'connected')
      return
    try {
      // Hub can restore an older iframe URL, so query parameters cannot decide
      // which shell owns navigation. Discover our anchor in its public registry.
      const docks = await (await getClient()).sharedState.get<DevToolsDockEntry[]>('devframe:docks', { initialValue: [] })
      if (disposed)
        return
      const update = () => {
        usesHostNavigation.value = docks.value().some(entry => entry.type === 'iframe'
          && entry.frameId === DEVTOOLS_FRAME_ID && entry.subTabs?.protocol === 'postmessage')
      }
      update()
      unsubscribe = docks.on('updated', update)
    }
    catch (error) {
      if (!disposed)
        connectionError.value = String(error)
    }
  }, { immediate: true })
}

export function useValaxyNavigation() {
  const { t } = useI18n()
  const route = useRoute()
  const entries = computed(() => pages
    .filter(page => page.id !== 'addons' || extensions.value.plugins.length)
    .map(page => ({ ...page, title: t(page.label) })))
  const current = computed(() => entries.value.find(page => page.path === route.path))
  const items = computed(() => entries.value.map(page => ({
    value: page.path,
    label: page.title,
    icon: page.icon,
    href: `#${page.path}`,
  })))
  const tabs = computed<DevToolsFrameTab[]>(() => entries.value.map((page, order) => ({
    id: page.id,
    title: page.title,
    // Use bundled Phosphor SVGs in the host as well as local UnoCSS icons in
    // the standalone shell; navigation does not depend on the Iconify CDN.
    icon: `mask:${new URL(`${import.meta.env.BASE_URL}icons/${page.icon.slice('i-ph:'.length)}.svg`, window.location.href).href}`,
    navTarget: { path: page.path },
    groupId: 'valaxy:tools',
    category: 'framework',
    order,
  })))
  return { current, items, tabs }
}
