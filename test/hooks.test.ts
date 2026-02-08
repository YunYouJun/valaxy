import type { MdAfterRenderContext, ResolvedValaxyOptions } from '../packages/valaxy/node'
import { describe, expect, it, vi } from 'vitest'
import { resolveOptions } from '../packages/valaxy/node'
import { createValaxyNode } from '../packages/valaxy/node/app'
import { fixtureFolder } from './shared'

describe('md:afterRender hook', async () => {
  const baseOptions = await resolveOptions({ userRoot: fixtureFolder.userRoot })

  it('registers md:afterRender hook from config.hooks', () => {
    const hookFn = vi.fn()
    const options: ResolvedValaxyOptions = {
      ...baseOptions,
      config: {
        ...baseOptions.config,
        hooks: {
          'md:afterRender': hookFn,
        },
      },
    }

    const valaxyNode = createValaxyNode(options)

    // Hook should be registered
    expect(valaxyNode.hooks).toBeDefined()
    // Trigger the hook manually and verify it fires
    const ctx: MdAfterRenderContext = {
      route: {} as any,
      data: { title: 'Test' },
      excerpt: '<p>test excerpt</p>',
      content: '# Test\n\ntest content',
      path: '/test.md',
    }

    valaxyNode.hooks.callHook('md:afterRender', ctx)
    expect(hookFn).toHaveBeenCalledOnce()
    expect(hookFn).toHaveBeenCalledWith(ctx)
  })

  it('registers md:afterRender hook from addon setup', () => {
    const hookFn = vi.fn()
    const options: ResolvedValaxyOptions = {
      ...baseOptions,
      addons: [
        {
          name: 'test-addon',
          enable: true,
          global: false,
          props: {},
          root: '/fake',
          options: {},
          pkg: { name: 'test-addon', version: '0.0.0' },
          setup(valaxy) {
            valaxy.hook('md:afterRender', hookFn)
          },
        },
      ],
    }

    const valaxyNode = createValaxyNode(options)

    const ctx: MdAfterRenderContext = {
      route: {} as any,
      data: { title: 'Addon Test' },
      excerpt: '',
      content: 'addon content',
      path: '/addon-test.md',
    }

    valaxyNode.hooks.callHook('md:afterRender', ctx)
    expect(hookFn).toHaveBeenCalledOnce()
    expect(hookFn).toHaveBeenCalledWith(ctx)
  })

  it('does not register build-only hooks in dev mode', () => {
    const buildHookFn = vi.fn()
    const mdHookFn = vi.fn()
    const options: ResolvedValaxyOptions = {
      ...baseOptions,
      mode: 'dev',
      config: {
        ...baseOptions.config,
        hooks: {
          'build:before': buildHookFn,
          'md:afterRender': mdHookFn,
        },
      },
    }

    const valaxyNode = createValaxyNode(options)

    valaxyNode.hooks.callHook('build:before')
    expect(buildHookFn).not.toHaveBeenCalled()

    valaxyNode.hooks.callHook('md:afterRender', {
      route: {} as any,
      data: {},
      excerpt: '',
      content: '',
      path: '',
    })
    expect(mdHookFn).toHaveBeenCalledOnce()
  })
})
