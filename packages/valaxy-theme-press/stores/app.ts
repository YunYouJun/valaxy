import { acceptHMRUpdate, defineStore } from 'pinia'
import { computed, ref } from 'vue'

type NavigationPanel = 'menu' | 'sidebar' | 'outline'

export const usePressAppStore = defineStore('press-app', () => {
  const activePanel = ref<NavigationPanel | null>(null)

  function closePanel() {
    activePanel.value = null
  }

  function togglePanel(panel: NavigationPanel) {
    activePanel.value = activePanel.value === panel ? null : panel
  }

  // Keep the existing outline control available to theme extensions.
  const isRightSidebarOpen = computed(() => activePanel.value === 'outline')
  function toggleRightSidebar(value = !isRightSidebarOpen.value) {
    if (value)
      activePanel.value = 'outline'
    else if (isRightSidebarOpen.value)
      closePanel()
    return isRightSidebarOpen.value
  }

  return {
    activePanel,
    closePanel,
    togglePanel,
    rightSidebar: {
      isOpen: isRightSidebarOpen,
      toggle: toggleRightSidebar,
    },
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(usePressAppStore, import.meta.hot))
