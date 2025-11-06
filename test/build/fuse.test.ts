import { resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'
import { demoYunDistFolder } from '../config'

/**
 * valaxy fuse module
 */
describe('valaxy fuse', async () => {
  // hello-valaxy.md generate hello-valaxy.html
  it('valaxy-fuse-list.json should be generated and not empty', async () => {
    const fuseListFile = resolve(demoYunDistFolder, 'valaxy-fuse-list.json')
    expect(await fs.exists(fuseListFile)).toBe(true)

    const fuseList = await fs.readJSON(fuseListFile)
    expect(fuseList.length).toBeGreaterThan(0)
  })
})
