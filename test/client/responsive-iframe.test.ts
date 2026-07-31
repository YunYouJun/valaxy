// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { setIframeAspectRatios } from '../../packages/valaxy/client/utils/iframe'

describe('responsive markdown iframe', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('derives each iframe aspect ratio from its dimensions', () => {
    document.body.innerHTML = `
      <main>
        <iframe id="landscape" width="1080" height="608"></iframe>
        <iframe id="portrait" width="608" height="1080"></iframe>
      </main>
    `

    setIframeAspectRatios(document.querySelector('main')!)

    const landscape = document.querySelector<HTMLIFrameElement>('#landscape')!
    const portrait = document.querySelector<HTMLIFrameElement>('#portrait')!
    expect(landscape.hasAttribute('data-va-responsive-iframe')).toBe(true)
    expect(landscape.style.getPropertyValue('--va-iframe-aspect-ratio')).toBe('1080 / 608')
    expect(portrait.hasAttribute('data-va-responsive-iframe')).toBe(true)
    expect(portrait.style.getPropertyValue('--va-iframe-aspect-ratio')).toBe('608 / 1080')
  })

  it('ignores iframes without two positive numeric dimensions', () => {
    document.body.innerHTML = `
      <iframe id="dimensionless"></iframe>
      <iframe id="zero" width="0" height="608"></iframe>
      <iframe id="invalid" width="wide" height="608"></iframe>
    `

    setIframeAspectRatios()

    document.querySelectorAll('iframe').forEach((iframe) => {
      expect(iframe.hasAttribute('data-va-responsive-iframe')).toBe(false)
      expect(iframe.style.getPropertyValue('--va-iframe-aspect-ratio')).toBe('')
    })
  })

  it('cleans generated styles when dimensions are removed', () => {
    document.body.innerHTML = '<iframe width="1080" height="608"></iframe>'
    const iframe = document.querySelector('iframe')!

    setIframeAspectRatios()
    iframe.removeAttribute('height')
    setIframeAspectRatios()

    expect(iframe.hasAttribute('data-va-responsive-iframe')).toBe(false)
    expect(iframe.style.getPropertyValue('--va-iframe-aspect-ratio')).toBe('')
  })
})
