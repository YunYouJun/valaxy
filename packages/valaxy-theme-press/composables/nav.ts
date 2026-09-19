import { computed } from 'vue'
import { usePressAppStore } from '../stores'

export function useNav() {
  const press = usePressAppStore()
  const isScreenOpen = computed(() => press.activePanel === 'menu')

  function openScreen() {
    press.activePanel = 'menu'
  }

  function closeScreen() {
    if (isScreenOpen.value)
      press.closePanel()
  }

  function toggleScreen() {
    press.togglePanel('menu')
  }

  return { isScreenOpen, openScreen, closeScreen, toggleScreen }
}
