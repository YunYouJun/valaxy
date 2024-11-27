import { resolve } from 'node:path'
import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'

const demoFolder = resolve(__dirname, '../../demo')
const demoYunDistFolder = resolve(demoFolder, 'yun/dist')

// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('check dist', async () => {
  // hello-valaxy.md generate hello-valaxy.html
  it('post should be generated', () => {
    const helloValaxyHtml = resolve(demoYunDistFolder, 'posts/hello-valaxy.html')
    expect(fs.existsSync(helloValaxyHtml)).toBe(true)
  })

  // draft.md not generate draft.html
  it('draft should not be generated', () => {
    const draftHtml = resolve(demoYunDistFolder, 'posts/draft.html')
    expect(fs.existsSync(draftHtml)).toBe(false)
  })
})
