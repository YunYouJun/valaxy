// @vitest-environment jsdom
import type { AlgoliaSearchOptions } from '../../packages/valaxy-addon-algolia/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, shallowRef } from 'vue'
import AlgoliaSearchBox from '../../packages/valaxy-addon-algolia/components/AlgoliaSearchBox.vue'
import PressAlgoliaSearch from '../../packages/valaxy-theme-press/components/PressAlgoliaSearch.vue'

const sdk = vi.hoisted(() => ({
  keyword: vi.fn(),
  ai: vi.fn(),
  sidepanel: vi.fn(),
  keywordInstance: { destroy: vi.fn() },
  aiInstance: { destroy: vi.fn() },
  sidepanelInstance: { destroy: vi.fn() },
}))

const addon = shallowRef<{ options: AlgoliaSearchOptions }>()

vi.mock('@docsearch/js/docsearch', () => ({ default: sdk.keyword }))
vi.mock('@docsearch/js', () => ({ default: sdk.ai }))
vi.mock('@docsearch/sidepanel-js', () => ({ default: sdk.sidepanel }))
vi.mock('valaxy', () => ({ useAddonConfig: () => addon }))
vi.mock('vue-router', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('vue-i18n', () => ({ useI18n: () => ({ locale: shallowRef('en') }) }))

let unmount: (() => void) | undefined

beforeEach(() => {
  vi.clearAllMocks()
  sdk.keyword.mockReturnValue(sdk.keywordInstance)
  sdk.ai.mockReturnValue(sdk.aiInstance)
  sdk.sidepanel.mockReturnValue(sdk.sidepanelInstance)
  addon.value = { options: { appId: 'app', apiKey: 'search-key', indexName: 'docs' } }
})

afterEach(() => {
  unmount?.()
  unmount = undefined
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

for (const [name, component] of [['addon', AlgoliaSearchBox], ['Press', PressAlgoliaSearch]] as const) {
  describe(`${name} DocSearch 5 integration`, () => {
    function mount() {
      const container = document.createElement('div')
      document.body.append(container)
      const app = createApp(component)
      app.mount(container)
      unmount = () => app.unmount()
    }

    it('uses keyword search without Ask AI and preserves index filters', async () => {
      addon.value!.options.searchParameters = { filters: 'lang:en' }
      mount()
      await vi.waitFor(() => expect(sdk.keyword).toHaveBeenCalledOnce())
      expect(sdk.keyword).toHaveBeenCalledWith(expect.objectContaining({
        indices: [{ name: 'docs', searchParameters: { filters: 'lang:en' } }],
      }))
      expect(sdk.ai).not.toHaveBeenCalled()
      expect(sdk.sidepanel).not.toHaveBeenCalled()
    })

    it.each(['agent-123', { agentId: 'agent-123' }])('enables AI with agent configuration %j', async (askAi) => {
      addon.value!.options.askAi = askAi
      mount()
      await vi.waitFor(() => expect(sdk.ai).toHaveBeenCalledOnce())
      expect(sdk.ai).toHaveBeenCalledWith(expect.objectContaining({
        askAi: expect.objectContaining({ agentId: 'agent-123', indices: ['docs'] }),
      }))
      expect(sdk.keyword).not.toHaveBeenCalled()
      unmount!()
      unmount = undefined
      expect(sdk.aiInstance.destroy).toHaveBeenCalledOnce()
    })

    it('preserves AI credentials, indices and per-index search overrides', async () => {
      const searchParameters = { 'ai-docs': { filters: 'lang:zh-CN' } }
      addon.value!.options.askAi = {
        agentId: 'agent-123',
        appId: 'ai-app',
        apiKey: 'ai-search-key',
        indexName: 'fallback',
        indices: ['ai-docs'],
        searchParameters,
        suggestedQuestions: true,
      }
      mount()
      await vi.waitFor(() => expect(sdk.ai).toHaveBeenCalledOnce())
      expect(sdk.ai).toHaveBeenCalledWith(expect.objectContaining({
        askAi: {
          agentId: 'agent-123',
          appId: 'ai-app',
          apiKey: 'ai-search-key',
          indices: ['ai-docs'],
          searchParameters,
          suggestedQuestions: true,
        },
      }))
    })

    it('does not reinterpret a legacy assistant ID as an agent ID', async () => {
      // JavaScript users can still supply the removed v4 configuration.
      addon.value!.options.askAi = { assistantId: 'legacy-assistant' } as unknown as AlgoliaSearchOptions['askAi']
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      mount()
      await vi.waitFor(() => expect(sdk.keyword).toHaveBeenCalledOnce())
      expect(sdk.ai).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('agentId'))
    })

    it('destroys the previous instance when AI is disabled', async () => {
      addon.value!.options.askAi = 'agent-123'
      mount()
      await vi.waitFor(() => expect(sdk.ai).toHaveBeenCalledOnce())
      addon.value = { options: { appId: 'app', apiKey: 'search-key', indexName: 'docs' } }
      await vi.waitFor(() => expect(sdk.keyword).toHaveBeenCalledOnce())
      expect(sdk.aiInstance.destroy).toHaveBeenCalledOnce()
    })

    it('does not initialize after unmount while setup is pending', async () => {
      addon.value!.options.askAi = 'agent-123'
      mount()
      unmount!()
      unmount = undefined
      await nextTick()
      await vi.dynamicImportSettled()
      expect(sdk.ai).not.toHaveBeenCalled()
      expect(sdk.keyword).not.toHaveBeenCalled()
    })
  })
}

it('passes the Agent Studio configuration to the Press sidepanel and destroys it on unmount', async () => {
  addon.value!.options.askAi = {
    agentId: 'agent-123',
    sidePanel: true,
    indices: ['ai-docs'],
    searchParameters: { 'ai-docs': { filters: 'lang:en' } },
  }
  const container = document.createElement('div')
  document.body.append(container)
  const app = createApp(PressAlgoliaSearch)
  app.mount(container)
  unmount = () => app.unmount()
  await vi.waitFor(() => expect(sdk.ai).toHaveBeenCalledOnce())
  expect(sdk.sidepanel).toHaveBeenCalledWith(expect.objectContaining({
    agentId: 'agent-123',
    appId: 'app',
    apiKey: 'search-key',
    indices: ['ai-docs'],
    searchParameters: { 'ai-docs': { filters: 'lang:en' } },
  }))
  unmount()
  unmount = undefined
  expect(sdk.sidepanelInstance.destroy).toHaveBeenCalledOnce()
})
