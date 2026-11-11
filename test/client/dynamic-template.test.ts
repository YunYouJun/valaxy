// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { compile } from 'vue/dist/vue.esm-bundler.js'
import { renderToString } from 'vue/server-renderer'
import ValaxyDynamicComponent from '../../packages/valaxy/client/components/ValaxyDynamicComponent.vue'

vi.mock('vue/dist/vue.esm-bundler.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue/dist/vue.esm-bundler.js')>()
  return { ...actual, compile: vi.fn(actual.compile) }
})

afterEach(() => vi.clearAllMocks())

it('keeps empty templates idle and renders the latest props after loading without recompiling data changes', async () => {
  const template = ref('')
  const data = ref({ label: 'Before' })
  const rendered = vi.fn()
  const container = document.createElement('div')
  const app = createApp({
    render: () => h(ValaxyDynamicComponent, { templateStr: template.value, data: data.value, onRendered: rendered }),
  })
  app.mount(container)
  try {
    await nextTick()
    expect(compile).not.toHaveBeenCalled()
    expect(rendered).not.toHaveBeenCalled()
    template.value = '<p>{{ label }}</p>'
    await nextTick()
    data.value = { label: 'Latest' }
    await vi.waitFor(() => expect(container.textContent).toBe('Latest'))
    expect(compile).toHaveBeenCalledTimes(1)
    expect(rendered).toHaveBeenCalled()

    data.value = { label: 'Updated' }
    await nextTick()
    expect(container.textContent).toBe('Updated')
    expect(compile).toHaveBeenCalledTimes(1)

    template.value = '<strong>{{ label }}!</strong>'
    await nextTick()
    expect(container.querySelector('strong')!.textContent).toBe('Updated!')
    expect(compile).toHaveBeenCalledTimes(2)

    template.value = ''
    await nextTick()
    expect(container.textContent).toBe('')
  }
  finally { app.unmount() }
})

it('server renders dynamic templates and hydrates registered components without losing their HTML', async () => {
  const Counter = defineComponent({
    setup() {
      const count = ref(0)
      return () => h('button', { onClick: () => count.value++ }, `Count: ${count.value}`)
    },
  })
  const templateStr = '<section><p>{{ frontmatter.title }}</p><TemplateCounter /></section>'
  const makeApp = () => createSSRApp(ValaxyDynamicComponent, {
    templateStr,
    data: { frontmatter: { title: 'SSR excerpt' } },
  }).component('TemplateCounter', Counter)
  const html = await renderToString(makeApp())
  expect(html).toContain('<p>SSR excerpt</p>')
  expect(html).toContain('<button>Count: 0</button>')
  const container = document.createElement('div')
  container.innerHTML = html
  const button = container.querySelector('button')!
  const warnings = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {})
  const app = makeApp()
  app.mount(container)
  try {
    expect(container.querySelector('button')).toBe(button)
    await vi.waitFor(async () => {
      button.click()
      await nextTick()
      expect(button.textContent).not.toBe('Count: 0')
    })
    expect(container.querySelector('button')).toBe(button)
    expect(warnings).not.toHaveBeenCalled()
    expect(errors).not.toHaveBeenCalled()
  }
  finally {
    app.unmount()
    warnings.mockRestore()
    errors.mockRestore()
  }
})
