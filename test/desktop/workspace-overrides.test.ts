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

it('reads dependency overrides from pnpm-workspace.yaml', async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-workspace-overrides-'))
  const filename = join(root, 'pnpm-workspace.yaml')
  await writeFile(filename, 'packages: []\noverrides:\n  unocss: 66.10.5\n  vue: catalog:frontend\n')

  await expect(readWorkspaceOverrides(filename)).resolves.toEqual({
    unocss: '66.10.5',
    vue: 'catalog:frontend',
  })
})
