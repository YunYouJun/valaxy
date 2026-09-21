import type { EditableTreeNode } from 'vue-router/unplugin'
import { tmpdir } from 'node:os'
import { resolve } from 'pathe'
import { beforeEach, expect, it, vi } from 'vitest'
import { EditorRoutes } from '../packages/valaxy/node/editor/routes'

const { canonicalize } = vi.hoisted(() => ({ canonicalize: vi.fn<(file: string) => Promise<string>>() }))
vi.mock('node:fs/promises', () => ({ realpath: canonicalize }))

const root = resolve(tmpdir(), 'valaxy-editor-race')
const file = resolve(root, 'post.md')

function tree(path: string) {
  return [{ fullPath: path, params: [], components: new Map([['default', file]]) }] as unknown as EditableTreeNode
}

beforeEach(() => {
  canonicalize.mockReset().mockImplementation(async file => file)
})

it.each(['older-first', 'newer-first'])('keeps the latest route snapshot when overlapping lookups finish %s', async (order) => {
  const routes = new EditorRoutes()
  await routes.update(tree('/initial'))
  let releaseOlder!: (file: string) => void
  let releaseNewer!: (file: string) => void
  canonicalize.mockImplementationOnce(() => new Promise((resolve) => {
    releaseOlder = resolve
  }))
  routes.begin(file)()
  const older = routes.update(tree('/older'))
  canonicalize.mockImplementationOnce(() => new Promise((resolve) => {
    releaseNewer = resolve
  }))
  routes.begin(file)()
  const newer = routes.update(tree('/newer'))

  if (order === 'older-first') {
    releaseOlder(file)
    await older
    expect(await routes.resolve(root, 'post.md')).toEqual({ status: 'pending', routes: [] })
    releaseNewer(file)
    await newer
  }
  else {
    releaseNewer(file)
    await newer
    expect(await routes.resolve(root, 'post.md')).toEqual({ status: 'resolved', routes: [{ path: '/newer', dynamic: false }] })
    releaseOlder(file)
    await older
  }
  expect(await routes.resolve(root, 'post.md')).toEqual({ status: 'resolved', routes: [{ path: '/newer', dynamic: false }] })
})
