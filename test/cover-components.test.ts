import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'pathe'
import { afterEach, expect, it } from 'vitest'
import { scanCoverComponents } from '../packages/valaxy/node/plugins/coverComponents'

const roots: string[] = []
afterEach(async () => {
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-covers-'))
  roots.push(root)
  return root
}

async function component(root: string, path: string) {
  const file = join(root, path)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, '<template><div /></template>')
  return file
}

it('discovers only cover SFCs with user overrides and literal project paths', async () => {
  const root = join(await fixture(), '(preview)[2026]{site}')
  const theme = join(root, 'theme/components')
  const user = join(root, 'user/components')
  const themeCover = await component(theme, 'covers/HelloSky.vue')
  const userCover = await component(user, 'covers/HelloSky.vue')
  await component(user, 'Unrelated.vue')
  await component(user, 'covers/.exclude/Secret.vue')
  const nested = await component(user, 'covers/art/deep-space.vue')

  const covers = await scanCoverComponents([theme, user, join(root, 'missing')])
  expect([...covers.keys()]).toEqual(['HelloSky', 'DeepSpace'])
  expect(covers.get('HelloSky')).toBe(userCover)
  expect(covers.get('DeepSpace')).toBe(nested)
  await rm(userCover)
  expect((await scanCoverComponents([theme, user])).get('HelloSky')).toBe(themeCover)
})

it('rejects ambiguous names within the same root', async () => {
  const root = await fixture()
  await component(root, 'covers/one/Sky.vue')
  await component(root, 'covers/two/Sky.vue')
  await expect(scanCoverComponents([root])).rejects.toThrow('Duplicate cover component Sky')
})
