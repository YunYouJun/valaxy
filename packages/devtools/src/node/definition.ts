import type { RpcDefinitionsToFunctionsWithNamespace } from 'devframe/rpc'
import type { ValaxyDevtoolsPlugin } from '../plugin'
import type { ValaxyDevtoolsData } from '../shared/extensions'
import type { ServerFunctions } from '../shared/rpc'
import type { ResourceState } from '../shared/state'
import type { ValaxyDevtoolsOptions } from './types'
import { normalizeRepositoryUrl } from '@valaxyjs/utils'
import { defineDevframe, defineRpcFunction } from 'devframe'
import * as v from 'valibot'
import pkg from '../../package.json'
import { DIR_CLIENT } from '../dir'
import { DEVTOOLS_ID, resolveDevtoolsBase, resolveDevtoolsLogo } from '../shared/constants'
import { RESOURCES_STATE } from '../shared/state'
import { createDataApi, createManifest, resolveDevtoolsPlugins, setupExtensions, validateEditorFields } from './extensions'
import { getFunctions } from './functions'

const fields = v.record(v.string(), v.unknown())
const filePaths = v.array(v.string())
const pageData = v.object({ routePath: v.string(), filePath: v.string(), frontmatter: fields })
const success = v.object({ success: v.boolean() })
const postContent = v.object({ content: v.string(), revision: v.string() })

export function createRpcFunctions(functions: ServerFunctions) {
  return [
    defineRpcFunction({ name: 'get-post-content', type: 'query', jsonSerializable: true, args: [v.string()], returns: postContent, handler: functions.getPostContent }),
    defineRpcFunction({
      name: 'update-post-content',
      type: 'action',
      jsonSerializable: true,
      args: [v.object({ filePath: v.string(), content: v.pipe(v.string(), v.maxLength(2_000_000)), revision: v.string() })],
      returns: postContent,
      handler: functions.updatePostContent,
    }),
    defineRpcFunction({ name: 'get-options', type: 'query', jsonSerializable: true, handler: functions.getOptions }),
    defineRpcFunction({ name: 'get-post-list', type: 'query', jsonSerializable: true, handler: functions.getPostList }),
    defineRpcFunction({ name: 'get-page-data', type: 'query', jsonSerializable: true, args: [v.string()], returns: pageData, handler: functions.getPageData }),
    defineRpcFunction({ name: 'get-collection-list', type: 'query', jsonSerializable: true, handler: functions.getCollectionList }),
    defineRpcFunction({ name: 'get-config', type: 'query', jsonSerializable: true, handler: functions.getConfig }),
    defineRpcFunction({
      name: 'create-post',
      type: 'action',
      jsonSerializable: true,
      args: [v.object({ title: v.pipe(v.string(), v.minLength(1)), path: v.optional(v.string()), tags: v.optional(v.array(v.string())), categories: v.optional(v.array(v.string())) })],
      returns: v.object({ success: v.boolean(), filePath: v.optional(v.string()), error: v.optional(v.string()) }),
      handler: functions.createPost,
    }),
    defineRpcFunction({
      name: 'update-frontmatter',
      type: 'action',
      jsonSerializable: true,
      args: [v.object({ filePath: v.string(), frontmatter: fields })],
      returns: success,
      handler: functions.updateFrontmatter,
    }),
    defineRpcFunction({
      name: 'batch-update-frontmatter',
      type: 'action',
      jsonSerializable: true,
      args: [filePaths, v.array(v.variant('type', [
        v.object({ type: v.literal('set'), key: v.string(), value: v.unknown() }),
        v.object({ type: v.literal('delete'), key: v.string() }),
        v.object({ type: v.literal('rename'), key: v.string(), newKey: v.string() }),
      ]))],
      returns: v.object({ total: v.number(), updated: v.number(), errors: v.array(v.object({ filePath: v.string(), error: v.string() })) }),
      handler: functions.batchUpdateFrontmatter,
    }),
    defineRpcFunction({
      name: 'update-config-field',
      type: 'action',
      jsonSerializable: true,
      args: [v.picklist(['site', 'valaxy', 'theme']), v.string(), v.unknown()],
      returns: v.object({ success: v.boolean(), error: v.optional(v.string()) }),
      handler: functions.updateConfigField,
    }),
    defineRpcFunction({
      name: 'run-migration',
      type: 'action',
      jsonSerializable: true,
      args: [filePaths, v.record(v.string(), v.string())],
      returns: success,
      handler: functions.runMigration,
    }),
    defineRpcFunction({
      name: 'open-in-editor',
      type: 'action',
      args: [v.object({ file: v.string(), line: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))), column: v.optional(v.pipe(v.number(), v.integer(), v.minValue(0))) })],
      returns: v.void(),
      handler: functions.openInEditor,
    }),
  ] as const
}

declare module 'devframe' {
  interface DevframeRpcServerFunctions extends RpcDefinitionsToFunctionsWithNamespace<'valaxy', ReturnType<typeof createRpcFunctions>> {}
}

export function createValaxyDevframe(options: ValaxyDevtoolsOptions = {}) {
  const cleanups: (() => void | Promise<void>)[] = []
  let plugins: ValaxyDevtoolsPlugin[] = []
  const onDispose = (cleanup: () => void | Promise<void>) => {
    cleanups.push(cleanup)
  }
  async function dispose() {
    const errors: unknown[] = []
    for (const cleanup of cleanups.splice(0).reverse()) {
      try {
        await cleanup()
      }
      catch (error) {
        errors.push(error)
      }
    }
    if (errors.length)
      throw new AggregateError(errors, 'Valaxy DevTools cleanup failed')
  }
  const definition = defineDevframe({
    id: DEVTOOLS_ID,
    name: 'Valaxy',
    version: pkg.version,
    packageName: pkg.name,
    importMetaUrl: import.meta.url,
    homepage: normalizeRepositoryUrl(pkg.repository.url),
    description: pkg.description,
    icon: resolveDevtoolsLogo(options.base),
    basePath: resolveDevtoolsBase(options.base),
    clientAssets: DIR_CLIENT,
    capabilities: { dev: true, build: false },
    services: [{ package: '@devframes/service-shiki', options: { langs: ['json'] } }],
    async setup(ctx) {
      await ctx.rpc.sharedState.get<ResourceState>(RESOURCES_STATE, { initialValue: { revision: 0 } })
      plugins = await resolveDevtoolsPlugins(options)
      const functions = getFunctions(options, data => validateEditorFields(plugins, data))
      const data = createDataApi(ctx, {
        getOptions: functions.getOptions,
        getPostList: functions.getPostList,
        getPageData: functions.getPageData,
        getCollectionList: functions.getCollectionList,
        getConfig: functions.getConfig,
      }, onDispose)
      const scoped = ctx.scope(DEVTOOLS_ID)
      for (const fn of createRpcFunctions(functions))
        scoped.rpc.register(fn)
      const manifest = createManifest(plugins, options.base)
      for (const fn of createExtensionRpc(manifest, plugins, data))
        scoped.rpc.register(fn)
      try {
        await setupExtensions(ctx, plugins, manifest, data, onDispose)
      }
      catch (error) {
        await dispose()
        throw error
      }
    },
  })
  return Object.assign(definition, { dispose })
}

function createExtensionRpc(manifest: ReturnType<typeof createManifest>, plugins: ValaxyDevtoolsPlugin[], data: ValaxyDevtoolsData) {
  return [
    defineRpcFunction({ name: 'get-extensions', type: 'query', jsonSerializable: true, handler: () => manifest }),
    defineRpcFunction({
      name: 'run-editor-action',
      type: 'query',
      jsonSerializable: true,
      args: [v.string(), v.string(), fields],
      returns: v.object({ message: v.string(), severity: v.optional(v.picklist(['success', 'warn', 'error', 'info'])) }),
      handler: async (id: string, filePath: string, draft: Record<string, unknown>) => {
        const [pluginId, actionId, extra] = id.split(':')
        const action = !extra && plugins.find(plugin => plugin.id === pluginId)?.editor?.actions?.find(action => action.id === actionId)
        if (!action)
          throw new Error(`Unknown editor action: ${id}`)
        const page = await data.getPageData(filePath)
        return action.run({ page, draft: structuredClone(draft), data })
      },
    }),
  ] as const
}

declare module 'devframe' {
  interface DevframeRpcServerFunctions extends RpcDefinitionsToFunctionsWithNamespace<'valaxy', ReturnType<typeof createExtensionRpc>> {}
}
