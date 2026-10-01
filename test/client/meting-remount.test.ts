// @vitest-environment jsdom
import type { Component } from 'vue'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { createHead } from '@unhead/vue/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, ref } from 'vue'

const addon = vi.hoisted(() => ({
  global: false,
  props: {},
  options: { animationIn: true, autoHidden: true },
}))
const cdnPrefix = 'https://cdn.example.test/'
const aplayerScriptUrl = `${cdnPrefix}aplayer/dist/APlayer.min.js`
const metingScriptUrl = `${cdnPrefix}meting@2/dist/Meting.min.js`
const aplayerStyleUrl = `${cdnPrefix}aplayer/dist/APlayer.min.css`

vi.mock('valaxy', () => ({
  useAddonConfig: () => ref(addon),
  useSiteConfig: () => ref({ cdn: { prefix: cdnPrefix } }),
  useFrontmatter: () => ref({}),
}))
vi.mock('vue-router', () => ({ useRoute: () => ({ path: '/music' }) }))

// Render the actual addon CSS, which Vitest otherwise excludes from jsdom.
const sass = createRequire(resolve('packages/valaxy/package.json'))('sass')
const animationCss = sass.compileString(readFileSync('packages/valaxy-addon-meting/client/styles/animation-in.scss', 'utf8')).css
const mountedApps = new Set<ReturnType<typeof createApp>>()
let metingJs: Component
let head: ReturnType<typeof createHead>

async function settle() {
  await nextTick()
  await vi.runAllTimersAsync()
}

function mountPlayer() {
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp(metingJs, { fixed: true })
  app.use(head)
  // Valaxy compiles this tag as native. Preserve that behavior, including DOM
  // refs, when Vitest's Vue plugin resolves the tag through its component table.
  app.component('meting-js', 'meting-js' as unknown as Component)
  mountedApps.add(app)
  app.mount(container)
  const element = container.querySelector<HTMLElement>('meting-js')!
  return {
    element,
    unmount() {
      app.unmount()
      mountedApps.delete(app)
      container.remove()
    },
  }
}

function insertFixedPlayer(element: HTMLElement) {
  const player = document.createElement('div')
  player.className = 'aplayer aplayer-fixed aplayer-narrow'
  player.innerHTML = '<div class="aplayer-body"><button class="aplayer-miniswitcher"><span class="aplayer-icon"></span></button></div>'
  element.append(player)
  return player.querySelector<HTMLElement>('.aplayer-body')!
}

function script(url: string) {
  return document.head.querySelector<HTMLScriptElement>(`script[src="${url}"]`)
}

function style() {
  return document.head.querySelector<HTMLLinkElement>(`link[href="${aplayerStyleUrl}"]`)
}

async function finishScripts() {
  await settle()
  expect(script(aplayerScriptUrl)).not.toBeNull()
  // The browser's load event is the only external boundary simulated here.
  script(aplayerScriptUrl)!.dispatchEvent(new Event('load'))
  await settle()
  expect(script(metingScriptUrl)).not.toBeNull()
  script(metingScriptUrl)!.dispatchEvent(new Event('load'))
  await settle()
}

beforeEach(async () => {
  vi.resetModules()
  vi.useFakeTimers()
  document.head.innerHTML = ''
  document.body.innerHTML = ''
  const animationStyle = document.createElement('style')
  animationStyle.textContent = animationCss
  document.head.append(animationStyle)
  head = createHead({ document })
  metingJs = (await import('../../packages/valaxy-addon-meting/components/MetingJs.vue')).default
})

afterEach(async () => {
  for (const app of mountedApps)
    app.unmount()
  mountedApps.clear()
  await settle()
  vi.useRealTimers()
})

describe('meting component lifecycle', () => {
  it('reveals a global=false fixed player after navigating away and mounting it again', async () => {
    const first = mountPlayer()
    await finishScripts()
    const firstBody = insertFixedPlayer(first.element)
    await settle()
    expect(getComputedStyle(firstBody).display).not.toBe('none')
    first.unmount()
    await settle()

    const second = mountPlayer()
    const secondBody = insertFixedPlayer(second.element)
    expect(getComputedStyle(secondBody).display).toBe('none')
    await settle()

    expect(getComputedStyle(secondBody).display).not.toBe('none')
    expect(secondBody.style.left).toBe('-66px')
    secondBody.dispatchEvent(new MouseEvent('mouseenter'))
    expect(secondBody.style.left).toBe('0px')
  })

  it('initializes each live fixed instance without changing the first player', async () => {
    const first = mountPlayer()
    await finishScripts()
    const firstBody = insertFixedPlayer(first.element)
    await settle()
    firstBody.style.left = '-12px'

    const second = mountPlayer()
    const secondBody = insertFixedPlayer(second.element)
    await settle()

    expect(getComputedStyle(secondBody).display).not.toBe('none')
    expect(secondBody.style.left).toBe('-66px')
    expect(firstBody.style.left).toBe('-12px')
    secondBody.dispatchEvent(new MouseEvent('mouseenter'))
    expect(secondBody.style.left).toBe('0px')
    expect(firstBody.style.left).toBe('-12px')
    secondBody.dispatchEvent(new MouseEvent('mouseleave'))
    expect(secondBody.style.left).toBe('-66px')
  })

  it('preserves shared scripts and styles after the first owner unmounts and loads them once', async () => {
    const first = mountPlayer()
    await finishScripts()
    const aplayerScript = script(aplayerScriptUrl)
    const metingScript = script(metingScriptUrl)
    const aplayerStyle = style()
    expect(aplayerStyle).not.toBeNull()
    const second = mountPlayer()
    await settle()
    first.unmount()
    await settle()

    expect(script(aplayerScriptUrl)).toBe(aplayerScript)
    expect(script(metingScriptUrl)).toBe(metingScript)
    expect(style()).toBe(aplayerStyle)
    second.unmount()
    await settle()
    mountPlayer()
    await settle()

    expect(script(aplayerScriptUrl)).toBe(aplayerScript)
    expect(script(metingScriptUrl)).toBe(metingScript)
    expect(style()).not.toBeNull()
    expect(document.head.querySelectorAll(`script[src="${aplayerScriptUrl}"]`)).toHaveLength(1)
    expect(document.head.querySelectorAll(`script[src="${metingScriptUrl}"]`)).toHaveLength(1)
    expect(document.head.querySelectorAll(`link[href="${aplayerStyleUrl}"]`)).toHaveLength(1)
  })

  it('finishes the shared script dependency chain if the first owner unmounts during loading', async () => {
    const first = mountPlayer()
    await settle()
    const aplayerScript = script(aplayerScriptUrl)!
    expect(aplayerScript).not.toBeNull()
    expect(script(metingScriptUrl)).toBeNull()
    first.unmount()
    await settle()
    const second = mountPlayer()
    await settle()

    expect(script(aplayerScriptUrl)).toBe(aplayerScript)
    aplayerScript.dispatchEvent(new Event('load'))
    await settle()
    expect(script(metingScriptUrl)).not.toBeNull()
    script(metingScriptUrl)!.dispatchEvent(new Event('load'))
    const body = insertFixedPlayer(second.element)
    await settle()

    expect(style()).not.toBeNull()
    expect(getComputedStyle(body).display).not.toBe('none')
    expect(document.head.querySelectorAll(`script[src="${aplayerScriptUrl}"]`)).toHaveLength(1)
    expect(document.head.querySelectorAll(`script[src="${metingScriptUrl}"]`)).toHaveLength(1)
  })

  it('disposes each autoHidden listener and registers it on a later instance', async () => {
    const first = mountPlayer()
    await finishScripts()
    const firstBody = insertFixedPlayer(first.element)
    await settle()
    expect(firstBody.style.left).toBe('-66px')
    first.unmount()
    await settle()
    firstBody.dispatchEvent(new MouseEvent('mouseenter'))
    expect(firstBody.style.left).toBe('-66px')

    const second = mountPlayer()
    const secondBody = insertFixedPlayer(second.element)
    await settle()
    secondBody.dispatchEvent(new MouseEvent('mouseenter'))
    expect(secondBody.style.left).toBe('0px')
    second.unmount()
    await settle()
    secondBody.dispatchEvent(new MouseEvent('mouseleave'))
    expect(secondBody.style.left).toBe('0px')
  })
})
