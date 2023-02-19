import { describe, expect, it } from 'vitest'
import { getAddonRoot, readAddonModule } from '../packages/valaxy/node/utils/addons'

describe('addon parse', () => {
  it('addon:read:module', async () => {
    const options = await readAddonModule('./test/fixtures/addon', { cwd: process.cwd() })
    const result = {
      enable: true,
      name: 'valaxy-addon-test',
      global: false,
      root: getAddonRoot('./test/fixtures/addon', process.cwd()),
      options: {},
      props: {},
    }
    expect(options).toEqual(result)
  })
})
