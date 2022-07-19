import { describe, expect, it } from 'vitest'
import { getAddonRoot, parseAddonLike, parseAddonOptions, readAddonModule } from '../packages/valaxy/node/utils/addons'

describe('addon parse', () => {
  it('addon:like:boolean', () => {
    const option = parseAddonLike(false)
    const result = { enable: false }
    expect(option).toEqual(result)
  })

  it('addon:like:object', () => {
    const option = parseAddonLike({ global: false, options: { a: 123 } })
    const result = { enable: true, global: false, options: { a: 123 } }
    expect(option).toEqual(result)
  })

  it('addon:read:module', async () => {
    const option = await readAddonModule('vitest')
    const result = {
      enable: true,
      name: 'vitest',
      global: false,
      root: getAddonRoot('vitest', process.cwd()),
      options: {},
      props: {},
    }
    expect(option).toEqual(result)
  })

  it('addon:parse:cover', async () => {
    const addons = await parseAddonOptions([
      ['vitest', { global: true }],
      ['vitest', { global: false }],
    ])
    expect(addons[0].global).toBeFalsy()
    expect(addons.length).toEqual(1)
  })
})
