// @vitest-environment jsdom
import type { App } from 'vue'
import type { MetingOptions } from '../../packages/valaxy-addon-meting/types'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
import { onMetingInit } from '../../packages/valaxy-addon-meting/client/hook'
import { useMetingLoadObserver } from '../../packages/valaxy-addon-meting/client/observer'

// Vitest skips styles; compile the real entrance stylesheet for DOM visibility assertions.
const sass = createRequire(resolve('packages/valaxy/package.json'))('sass')
const animationCss = sass.compileString(readFileSync('packages/valaxy-addon-meting/client/styles/animation-in.scss', 'utf8')).css

let app: App | undefined

function mountMeting(options: MetingOptions['options'] = { animationIn: true }) {
  const host = document.createElement('div')
  document.body.append(host)
  app = createApp({
    setup() {
      const addon = { options }
      onMetingInit(addon)
      useMetingLoadObserver(addon)
      return () => h('div')
    },
  })
  app.mount(host)
}

function createPlayer(narrow = false) {
  const player = document.createElement('div')
  player.className = `aplayer aplayer-fixed${narrow ? ' aplayer-narrow' : ''}`
  player.innerHTML = '<div class="aplayer-body"><button class="aplayer-miniswitcher"><span class="aplayer-icon"></span></button></div>'
  document.body.append(player)
  return { player, body: player.querySelector<HTMLElement>('.aplayer-body')! }
}

async function finishLoading() {
  await Promise.resolve()
  await vi.runAllTimersAsync()
}

beforeEach(() => {
  vi.useFakeTimers()
  document.body.innerHTML = ''
  const style = document.createElement('style')
  style.textContent = animationCss
  document.head.append(style)
})

afterEach(() => {
  app?.unmount()
  app = undefined
  document.head.querySelectorAll('style').forEach(style => style.remove())
  vi.useRealTimers()
})

describe('meting entrance animation', () => {
  it('keeps the switcher visible when an initially normal fixed player is collapsed', async () => {
    mountMeting()
    const { player, body } = createPlayer()
    await finishLoading()

    player.classList.add('aplayer-narrow')
    expect(getComputedStyle(body).display).not.toBe('none')
    expect(body.style.left).toBe('0px')
  })

  it('reveals an initially narrow fixed player and keeps it visible after switching modes', async () => {
    mountMeting()
    const { player, body } = createPlayer(true)
    expect(getComputedStyle(body).display).toBe('none')
    await finishLoading()

    expect(getComputedStyle(body).display).not.toBe('none')
    expect(body.style.left).toBe('0px')
    player.classList.remove('aplayer-narrow')
    player.classList.add('aplayer-narrow')
    expect(getComputedStyle(body).display).not.toBe('none')
  })

  it('initializes a fixed player that already exists when the observer mounts', async () => {
    const { body } = createPlayer(true)
    mountMeting()
    await finishLoading()

    expect(getComputedStyle(body).display).not.toBe('none')
    expect(body.style.left).toBe('0px')
  })

  it('does not hide an expanded player on mouseleave when autoHidden is enabled', async () => {
    mountMeting({ animationIn: true, autoHidden: true })
    const { player, body } = createPlayer()
    await finishLoading()

    body.dispatchEvent(new MouseEvent('mouseleave'))
    expect(body.style.left).toBe('0px')
    player.classList.add('aplayer-narrow')
    player.querySelector<HTMLElement>('.aplayer-icon')!.click()
    body.dispatchEvent(new MouseEvent('mouseleave'))
    expect(body.style.left).toBe('-66px')
    expect(getComputedStyle(body).display).not.toBe('none')
  })

  it('removes autoHidden event listeners when the owner unmounts', async () => {
    mountMeting({ animationIn: true, autoHidden: true })
    const { body } = createPlayer(true)
    await finishLoading()
    expect(body.style.left).toBe('-66px')
    app!.unmount()
    app = undefined

    body.dispatchEvent(new MouseEvent('mouseenter'))
    expect(body.style.left).toBe('-66px')
  })

  it('cancels a pending load when the owner unmounts', async () => {
    mountMeting()
    const { body } = createPlayer(true)
    await Promise.resolve()
    app!.unmount()
    app = undefined
    await finishLoading()

    expect(getComputedStyle(body).display).toBe('none')
    expect(body.style.left).toBe('')
  })

  it('cancels the pending animation frame when the owner unmounts', async () => {
    mountMeting()
    const { body } = createPlayer(true)
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(0)
    app!.unmount()
    app = undefined
    await finishLoading()

    expect(body.style.left).toBe('')
  })
})
