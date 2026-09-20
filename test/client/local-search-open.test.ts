// @vitest-environment jsdom
import { expect, it, vi } from 'vitest'
import { createApp, nextTick, shallowRef } from 'vue'
import ValaxyLocalSearch from '../../packages/valaxy/client/components/ValaxyLocalSearch.vue'

const load = vi.hoisted(() => vi.fn())
vi.mock('../../packages/valaxy/client/composables/search/useLocalSearch', () => ({
  useLocalSearch: () => ({ results: shallowRef([]), loading: shallowRef(false), load }),
}))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))

it('loads the index when a conditional modal mounts already open', async () => {
  const container = document.createElement('div')
  const app = createApp(ValaxyLocalSearch, { open: true })
  app.mount(container)
  try {
    await nextTick()
    expect(load).toHaveBeenCalledOnce()
  }
  finally {
    app.unmount()
  }
})
