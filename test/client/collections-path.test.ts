import { describe, expect, it, vi } from 'vitest'
import { reactive, ref } from 'vue'

const state = vi.hoisted(() => ({ route: null as any, pages: null as any }))
vi.mock('vue-router', () => ({ useRoute: () => state.route }))
vi.mock('#valaxy/blog/collections', () => ({
  default: [{
    key: '小说',
    title: '小说',
    items: [
      { key: '第二章', title: '第二章' },
      { key: '第一章', title: '第一章' },
      { link: '/posts/中文Post测试', title: '番外' },
    ],
  }],
}))
vi.mock('../../packages/valaxy/client/composables/post', () => ({ usePageList: () => state.pages }))

const { useCollection, useCollectionPosts, usePostCollections } = await import('../../packages/valaxy/client/composables/collections')

// Route records and `route.path` are percent-encoded; collection config is raw.
describe('collections with non-ASCII keys', () => {
  it('resolves the current collection from an encoded route path', () => {
    state.route = reactive({ path: encodeURI('/collections/小说/第一章') })
    expect(useCollection().collection.value?.key).toBe('小说')
  })

  it('lists and orders collection pages whose paths are encoded', () => {
    state.pages = ref([
      { path: encodeURI('/collections/小说/第一章') },
      { path: encodeURI('/collections/小说/第二章') },
      { path: encodeURI('/collections/小说/') },
      { path: '/posts/hello' },
    ])
    expect(useCollectionPosts('小说').value.map(p => p.path)).toEqual([
      encodeURI('/collections/小说/第二章'),
      encodeURI('/collections/小说/第一章'),
    ])
  })

  it('finds memberships for encoded key-based and link-based item paths', () => {
    expect(usePostCollections(encodeURI('/collections/小说/第一章')).value).toMatchObject([{ itemIndex: 1 }])
    expect(usePostCollections(encodeURI('/posts/中文Post测试/')).value).toMatchObject([{ itemIndex: 2 }])
    expect(usePostCollections('/posts/hello').value).toEqual([])
  })
})
