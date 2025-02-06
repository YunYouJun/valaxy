import type { DefaultTheme } from 'vitepress/theme'
import type { ComputedRef, Ref } from 'vue'
import type { PressTheme } from '../types'

import { isClient } from '@vueuse/core'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect,
  watchPostEffect,
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
export function normalize(path: string): string {
  return decodeURI(path).replace(HASH_RE, '').replace(EXT_RE, '')
}

export function isActive(
  currentPath: string,
  matchPath?: string,
  asRegex: boolean = false,
): boolean {
  if (matchPath === undefined)
    return false

  currentPath = normalize(`/${currentPath}`)

  if (asRegex)
    return new RegExp(matchPath).test(currentPath)

  if (normalize(matchPath) !== currentPath)
    return false

  const hashMatch = matchPath.match(HASH_RE)

  if (hashMatch)
    return (isClient ? location.hash : '') === hashMatch[0]

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

const hashRef = ref(isClient ? location.hash : '')
if (isClient) {
  window.addEventListener('hashchange', () => {
    hashRef.value = location.hash
  })
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
  item: ComputedRef<DefaultTheme.SidebarItem>,
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
    isActiveLink.value = route.path === item.value.link
  }

  watch([route, item, hashRef], updateIsActiveLink)
  onMounted(updateIsActiveLink)

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

  watchEffect(() => {
    collapsed.value = !!(collapsible.value && item.value.collapsed)
  })

  watchPostEffect(() => {
    ;(isActiveLink.value || hasActiveLink.value) && (collapsed.value = false)
  })

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
