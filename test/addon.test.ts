import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { getAddonRoot, readAddonModule } from '../packages/valaxy/node/utils/addons'
import pkg from './fixtures/addon/package.json'

describe('addon parse', () => {
  it('addon:read:module', async () => {
    const options = await readAddonModule('./test/fixtures/addon', { cwd: process.cwd() })
    const result = {
      enable: true,
      name: 'valaxy-addon-test',
      global: false,
      root: await getAddonRoot('./test/fixtures/addon', process.cwd()),
      options: {},
      props: {},
      pkg,
    }
    expect(options).toEqual(result)
  })
})
