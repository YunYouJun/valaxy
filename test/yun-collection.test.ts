import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computed, reactive, shallowRef } from 'vue'

const state = vi.hoisted(() => ({ route: null as any, collection: null as any, memberships: null as any }))
vi.mock('vue-router', () => ({ useRoute: () => state.route }))
vi.mock('valaxy', () => ({
  useCollection: () => ({ collection: state.collection }),
  usePostCollections: () => computed(() => state.memberships.value[state.route.path] || []),
}))

const { useYunCollection } = await import('../packages/valaxy-theme-yun/composables/collection')

const first = { key: 'first', title: 'First' }
const second = { key: 'second', title: 'Second' }

beforeEach(() => {
  state.route = reactive({ path: '/posts/shared' })
  state.collection = shallowRef(undefined)
  state.memberships = shallowRef({
    '/posts/shared': [{ collection: first, itemIndex: 2 }, { collection: second, itemIndex: 0 }],
    '/collections/second/1': [{ collection: second, itemIndex: 0 }],
  })
})

describe('yun collection navigation context', () => {
  it('uses existing post membership with a deterministic first-collection fallback', () => {
    const { collection, currentIndex } = useYunCollection()
    expect(collection.value).toEqual(first)
    expect(currentIndex.value).toBe(2)
  })

  it('updates context after route changes without retaining a stale collection', () => {
    const { collection, currentIndex } = useYunCollection()
    state.route.path = '/collections/second/1'
    state.collection.value = second
    expect(collection.value).toEqual(second)
    expect(currentIndex.value).toBe(0)
    state.route.path = '/posts/unrelated'
    state.collection.value = undefined
    expect(collection.value).toBeUndefined()
    expect(currentIndex.value).toBe(-1)
  })

  it('does not select the first article on a collection home', () => {
    state.route.path = '/collections/second/'
    state.collection.value = second
    const { currentIndex } = useYunCollection()
    expect(currentIndex.value).toBe(-1)
  })
})
