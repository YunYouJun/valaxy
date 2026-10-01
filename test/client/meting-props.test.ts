// @vitest-environment jsdom
import type { Component } from 'vue'
import type { MetingProps } from '../../packages/valaxy-addon-meting/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, ref } from 'vue'
import MetingApp from '../../packages/valaxy-addon-meting/App.vue'
import { useAddonMeting } from '../../packages/valaxy-addon-meting/client/options'
import MetingJs from '../../packages/valaxy-addon-meting/components/MetingJs.vue'

const config = vi.hoisted(() => ({
  name: 'valaxy-addon-meting',
  global: true,
  props: {} as MetingProps,
  options: { animationIn: true },
}))
vi.mock('../../packages/valaxy-addon-meting/client', () => ({
  useMeting: () => {},
  useVisible: () => ref(true),
}))
vi.mock('valaxy', () => ({
  useAddonConfig: () => ref(config),
}))

const apps: ReturnType<typeof createApp>[] = []
afterEach(() => {
  apps.forEach(app => app.unmount())
  apps.length = 0
  config.props = {}
})

function mount(component: Component, props: MetingProps = {}) {
  const container = document.createElement('div')
  const app = createApp(component, props)
  // The framework compiles this tag as a native custom element. Register an
  // equivalent passthrough here because Vitest's Vue plugin has no addon config.
  app.component('meting-js', { render: () => h('meting-js') })
  apps.push(app)
  app.mount(container)
  return container.querySelector('meting-js')!
}

describe.each([
  ['global player', MetingApp],
  ['inline player', MetingJs],
] as const)('meting %s props (#747)', (_name, component) => {
  it('preserves upstream defaults for omitted Boolean attributes', () => {
    const element = mount(component, { fixed: true })
    expect(element.getAttribute('fixed')).toBe('true')
    // APlayer derives mini=true from fixed=true. mini=false breaks its info
    // panel initialization and prevents the addon load animation from running.
    for (const key of ['mini', 'autoplay', 'mutex', 'list-folded'])
      expect(element.hasAttribute(key), key).toBe(false)
  })

  it('uses addon Boolean props when the component omits them', () => {
    config.props = { 'fixed': true, 'mini': true, 'autoplay': true, 'mutex': true, 'list-folded': true }
    const element = mount(component)
    for (const key of Object.keys(config.props))
      expect(element.getAttribute(key), key).toBe('true')
  })

  it('preserves explicit false component props over addon props', () => {
    config.props = { 'fixed': true, 'mini': true, 'autoplay': true, 'mutex': true, 'list-folded': true }
    const element = mount(component, { 'fixed': false, 'mini': false, 'autoplay': false, 'mutex': false, 'list-folded': false })
    for (const key of Object.keys(config.props))
      expect(element.getAttribute(key), key).toBe('false')
  })

  it('preserves separators in multiword MetingJS attributes', () => {
    const props = { 'lrc-type': 2, 'list-max-height': '180px', 'storage-name': 'player-test' }
    const element = mount(component, props)
    for (const [key, value] of Object.entries(props))
      expect(element.getAttribute(key), key).toBe(String(value))
    expect(element.hasAttribute('lrctype')).toBe(false)
  })
})

it('keeps the global fixed default without forcing it on inline players', () => {
  expect(mount(MetingApp).getAttribute('fixed')).toBe('true')
  expect(mount(MetingJs).hasAttribute('fixed')).toBe(false)
})

it('retains the resolved addon props, visibility and behavior options', () => {
  config.props = { fixed: true, theme: '#39C5BB' }
  expect(useAddonMeting().value).toMatchObject({
    global: true,
    props: config.props,
    options: { animationIn: true },
  })
})
