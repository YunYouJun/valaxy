// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, reactive, ref } from 'vue'
import { useVisible } from '../../packages/valaxy-addon-meting/client'

const route = reactive({ path: '/player' })
const frontmatter = ref<{ aplayer?: boolean }>({})
vi.mock('vue-router', () => ({ useRoute: () => route }))
vi.mock('valaxy', () => ({
  useFrontmatter: () => frontmatter,
  useSiteConfig: () => ref({}),
  useAddonConfig: () => ref({ name: 'valaxy-addon-meting', global: false }),
}))

const scopes: ReturnType<typeof effectScope>[] = []
afterEach(() => {
  scopes.forEach(scope => scope.stop())
  scopes.length = 0
  frontmatter.value = {}
  route.path = '/player'
})

function visible(defaultVisible?: boolean) {
  const scope = effectScope()
  scopes.push(scope)
  return scope.run(() => useVisible(defaultVisible))!
}

describe('meting visibility', () => {
  it('shows inline players even when the global addon is disabled', () => {
    expect(visible(true).value).toBe(true)
    expect(visible().value).toBe(false)
  })

  it('honors frontmatter visibility for both global and inline players on navigation', async () => {
    const global = visible()
    const inline = visible(true)

    frontmatter.value = { aplayer: true }
    route.path = '/enabled'
    await nextTick()
    expect(global.value).toBe(true)
    expect(inline.value).toBe(true)

    frontmatter.value = { aplayer: false }
    route.path = '/hidden'
    await nextTick()
    expect(global.value).toBe(false)
    expect(inline.value).toBe(false)

    frontmatter.value = {}
    route.path = '/player'
    await nextTick()
    expect(global.value).toBe(false)
    expect(inline.value).toBe(true)
  })
})
