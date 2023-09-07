import { ref } from 'vue'

export function useAside() {
  // const { hasSidebar } = useSidebar()
  // const is960 = useMediaQuery('(min-width: 960px)')
  // const is1280 = useMediaQuery('(min-width: 1280px)')

  const isAsideEnabled = ref(true)

  return {
    isAsideEnabled,
  }
}
