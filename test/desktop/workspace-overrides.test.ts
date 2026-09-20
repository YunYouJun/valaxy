import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, expect, it } from 'vitest'
import { readWorkspaceOverrides } from '../../packages/desktop/scripts/workspace-overrides'

let root: string | undefined

afterEach(async () => {
  if (root)
    await rm(root, { recursive: true, force: true })
  root = undefined
})

it('resolves catalog overrides for standalone generated blogs', async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-workspace-overrides-'))
  const filename = join(root, 'pnpm-workspace.yaml')
  await writeFile(filename, 'packages: []\noverrides:\n  unocss: 66.10.5\n  vue: catalog:frontend\n  vite: "catalog:"\ncatalog:\n  vite: ^8.3.0\ncatalogs:\n  frontend:\n    vue: ^3.5.43\n')

  await expect(readWorkspaceOverrides(filename)).resolves.toEqual({
    unocss: '66.10.5',
    vue: '^3.5.43',
    vite: '^8.3.0',
  })
})

it('rejects missing catalog entries before packaging the desktop runtime', async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-workspace-overrides-'))
  const filename = join(root, 'pnpm-workspace.yaml')
  await writeFile(filename, 'overrides:\n  vue: catalog:frontend\n')

  await expect(readWorkspaceOverrides(filename)).rejects.toThrow('Missing catalog entry for vue in frontend')
})
