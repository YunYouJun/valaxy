import type { DesktopApi, DesktopState } from '../shared/types'
import { computed, onMounted, onUnmounted, shallowRef } from 'vue'

/** Subscribe to main-process state and surface recoverable action errors. */
export function useDesktop() {
  const state = shallowRef<DesktopState>({ recentProjects: [], preview: 'stopped', build: 'idle', logs: '' })
  const actionError = shallowRef('')
  const pending = shallowRef(false)
  const api: DesktopApi = window.valaxyDesktop
  let unsubscribe: (() => void) | undefined
  let revision = 0
  onMounted(async () => {
    unsubscribe = api.onState((next) => {
      revision++
      state.value = next
    })
    const current = revision
    try {
      const initial = await api.getState()
      if (current === revision)
        state.value = initial
    }
    catch (error) {
      actionError.value = String(error)
    }
  })
  onUnmounted(() => unsubscribe?.())

  async function run(action: () => Promise<void>) {
    if (pending.value)
      return
    pending.value = true
    actionError.value = ''
    try {
      await action()
    }
    catch (error) { actionError.value = error instanceof Error ? error.message : String(error) }
    finally { pending.value = false }
  }

  const busy = computed(() => pending.value || state.value.publishing || state.value.setup === 'installing' || state.value.build === 'building' || ['starting', 'stopping'].includes(state.value.preview))
  return { state, actionError, busy, run, api }
}
