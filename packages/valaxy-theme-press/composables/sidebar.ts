import type { ComputedRef, Ref } from 'vue'
import type { PressTheme } from '../types'

import { isClient } from '@vueuse/core'
import {
  computed,
  getCurrentInstance,
  getCurrentScope,
  onMounted,
  onScopeDispose,
  onUnmounted,
  ref,
  watch,
  watchEffect,
} from 'vue'
import { useRoute } from 'vue-router'

export interface SidebarControl {
  collapsed: Ref<boolean>
  collapsible: ComputedRef<boolean>
  isLink: ComputedRef<boolean>
  isActiveLink: Ref<boolean>
  hasActiveLink: ComputedRef<boolean>
  hasChildren: ComputedRef<boolean>
  toggle: () => void
}

export const HASH_RE = /#.*$/
export const EXT_RE = /(index)?\.(md|html)$/
const hashRef = ref('')
let hashListenerCount = 0

function onHashChange() {
  hashRef.value = window.location.hash
}

/**
 * Reset shared sidebar hash state cleanly between isolated unit tests.
 */
export function resetSidebarHashState() {
  if (isClient && hashListenerCount > 0)
    window.removeEventListener('hashchange', onHashChange)
  hashListenerCount = 0
  hashRef.value = ''
}

export function normalize(path: string): string {
  return decodeURI(path).replace(/[?#].*$/, '').replace(EXT_RE, '').replace(/\/$/, '') || '/'
}

export function isActive(
  currentPath: string,
  matchPath?: string,
  asRegex: boolean = false,
): boolean {
  if (matchPath === undefined)
    return false

  currentPath = normalize(currentPath.startsWith('/') ? currentPath : `/${currentPath}`)

  if (asRegex)
    return new RegExp(matchPath).test(currentPath)

  if (normalize(matchPath) !== currentPath)
    return false

  const hashMatch = matchPath.match(HASH_RE)

  if (hashMatch)
    return hashRef.value === hashMatch[0]

  return true
}

/**
 * a11y: cache the element that opened the Sidebar (the menu button) then
 * focus that button again when Menu is closed with Escape key.
 */
export function useCloseSidebarOnEscape(
  isOpen: Ref<boolean>,
  close: () => void,
) {
  let triggerElement: HTMLButtonElement | undefined

  watchEffect(() => {
    triggerElement = isOpen.value
      ? (document.activeElement as HTMLButtonElement)
      : undefined
  })

  onMounted(() => {
    window.addEventListener('keyup', onEscape)
  })

  onUnmounted(() => {
    window.removeEventListener('keyup', onEscape)
  })

  function onEscape(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen.value) {
      close()
      triggerElement?.focus()
    }
  }
}

function useClientHashTracker(route: ReturnType<typeof useRoute>, onSync: () => void) {
  let registered = false

  onMounted(() => {
    if (!isClient)
      return
    if (!registered) {
      if (hashListenerCount === 0)
        window.addEventListener('hashchange', onHashChange)
      hashListenerCount += 1
      registered = true
    }
    hashRef.value = route.hash || window.location.hash
    onSync()
  })

  watch(
    () => route.hash,
    (newHash) => {
      if (registered && newHash !== undefined)
        hashRef.value = newHash
    },
  )

  const cleanup = () => {
    if (!registered)
      return
    registered = false
    hashListenerCount = Math.max(0, hashListenerCount - 1)
    if (isClient && hashListenerCount === 0) {
      window.removeEventListener('hashchange', onHashChange)
      hashRef.value = ''
    }
  }

  if (getCurrentInstance())
    onUnmounted(cleanup)
  else if (getCurrentScope())
    onScopeDispose(cleanup)
}

/**
 * Check if the given sidebar item contains any active link.
 */
export function containsActiveLink(
  path: string,
  items: PressTheme.SidebarItem | PressTheme.SidebarItem[],
): boolean {
  if (Array.isArray(items))
    return items.some(item => containsActiveLink(path, item))

  return isActive(path, items.link)
    ? true
    : items.items
      ? containsActiveLink(path, items.items)
      : false
}

export function useSidebarControl(
  item: ComputedRef<PressTheme.SidebarItem>,
): SidebarControl {
  const collapsed = ref(false)

  const collapsible = computed(() => {
    return item.value.collapsed != null
  })

  const isLink = computed(() => {
    return !!item.value.link
  })

  const isActiveLink = ref(false)
  const route = useRoute()
  const updateIsActiveLink = () => {
    isActiveLink.value = isActive(route.path, item.value.link)
  }

  watch([() => route.path, item, hashRef], updateIsActiveLink, { immediate: true })
  useClientHashTracker(route, updateIsActiveLink)

  const hasActiveLink = computed(() => {
    if (isActiveLink.value)
      return true

    return item.value.items
      ? containsActiveLink(route.path, item.value.items)
      : false
  })

  const hasChildren = computed(() => {
    return !!(item.value.items && item.value.items.length)
  })

  // Open the active branch during SSR too, so lazy children hydrate in place.
  // Sidebar resolution recreates item objects on navigation. Handle defaults and
  // active state together so a later prop update cannot close the active branch.
  watch([item, isActiveLink, hasActiveLink, () => route.path], ([entry, active, hasActive]) => {
    collapsed.value = !(active || hasActive) && !!entry.collapsed
  }, { immediate: true })

  function toggle() {
    if (collapsible.value)
      collapsed.value = !collapsed.value
  }

  return {
    collapsed,
    collapsible,
    isLink,
    isActiveLink,
    hasActiveLink,
    hasChildren,
    toggle,
  }
}
