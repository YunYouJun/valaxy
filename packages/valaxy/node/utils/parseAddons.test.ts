import { describe, expect, it } from 'vitest'
import { parseAddonLike, parseAddonModule } from './parseAddons'
describe('parseAddons', () => {
  it('parseLike boolean', () => {
    const option = parseAddonLike(false)
    expect(option.enable).toBeFalsy()
  })
  it('parseLike, object', () => {
    const option = parseAddonLike({ global: false, options: { a: 123 } })
    expect(option).toEqual({ enable: true, global: false, options: { a: 123 } })
  })

  it('parseAddonModule read feasibility', async () => {
    const option = await parseAddonModule('vite')
    expect(option?.enable).toBeTruthy()
  })
})
