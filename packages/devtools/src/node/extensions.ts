import type { DevframeNodeContext } from 'devframe'
import type { ValaxyDevtoolsPlugin } from '../plugin'
import type { ValaxyDevtoolsData, ValaxyDevtoolsManifest } from '../shared/extensions'
import type { ResourceState } from '../shared/state'
import type { ValaxyDevtoolsOptions } from './types'
import fs from 'fs-extra'
import pathe from 'pathe'
import { resolveAddonBase } from '../shared/constants'
import { RESOURCES_STATE } from '../shared/state'
import { DANGEROUS_FIELD_KEYS } from './utils/config-rw'

const reservedFields = new Set(['title', 'date', 'updated', 'draft', 'hide', 'type', 'tags', 'categories', 'excerpt', 'excerpt_type', 'cover', 'toc', 'password', 'password_hint', 'encryptedContent', 'partiallyEncryptedContents', 'layout', 'path', 'permalink', 'abbrlink', 'url', 'author', 'top', 'sticky', 'comment'])
const identifier = /^[a-z][a-z0-9-]*$/

/** Validates the complete registry before any panel or RPC is installed. */
export async function resolveDevtoolsPlugins(options: ValaxyDevtoolsOptions) {
  const plugins: ValaxyDevtoolsPlugin[] = []
  const ids = new Set<string>()
  const fields = new Set<string>()
  for (const load of options.plugins || []) {
    const loaded = typeof load === 'function' ? await load() : load
    const plugin = 'default' in loaded ? loaded.default : loaded
    if (plugin.apiVersion !== 1 || !identifier.test(plugin.id) || !plugin.name || ids.has(plugin.id))
      throw new Error(`Invalid or duplicate Valaxy DevTools plugin: ${plugin.id}`)
    ids.add(plugin.id)
    const panelIds = new Set<string>()
    for (const panel of plugin.panels || []) {
      if (!identifier.test(panel.id) || panelIds.has(panel.id) || !panel.title)
        throw new Error(`Invalid or duplicate panel: ${plugin.id}:${panel.id}`)
      panelIds.add(panel.id)
      if (!pathe.isAbsolute(panel.clientAssets) || !await fs.pathExists(pathe.join(panel.clientAssets, 'index.html')))
        throw new Error(`Panel ${plugin.id}:${panel.id} requires a built clientAssets directory with index.html`)
    }
    for (const field of plugin.editor?.fields || []) {
      if (!/^[a-z][\w-]*$/i.test(field.key) || DANGEROUS_FIELD_KEYS.has(field.key) || reservedFields.has(field.key) || fields.has(field.key) || !field.label)
        throw new Error(`Invalid or duplicate editor field: ${field.key}`)
      fields.add(field.key)
      if (!['text', 'textarea', 'boolean', 'number', 'select'].includes(field.type))
        throw new Error(`Unsupported editor field type: ${field.key}`)
      if (field.type === 'select' && (!field.options.length || new Set(field.options.map(o => o.value)).size !== field.options.length || field.options.some(o => typeof o.value !== 'string' || !o.label)))
        throw new Error(`Invalid select options: ${field.key}`)
      if (field.type === 'number' && ((field.step !== undefined && (!Number.isFinite(field.step) || field.step <= 0)) || (field.min !== undefined && !Number.isFinite(field.min)) || (field.max !== undefined && !Number.isFinite(field.max)) || (field.min !== undefined && field.max !== undefined && field.min > field.max)))
        throw new Error(`Invalid number limits: ${field.key}`)
      if ((field.type === 'text' || field.type === 'textarea') && field.maxLength !== undefined && (!Number.isInteger(field.maxLength) || field.maxLength < 0))
        throw new Error(`Invalid text limit: ${field.key}`)
    }
    const actions = new Set<string>()
    for (const action of plugin.editor?.actions || []) {
      if (!identifier.test(action.id) || actions.has(action.id) || !action.label || typeof action.run !== 'function')
        throw new Error(`Invalid or duplicate editor action: ${plugin.id}:${action.id}`)
      actions.add(action.id)
    }
    plugins.push(plugin)
  }
  return plugins
}

export function validateEditorFields(plugins: ValaxyDevtoolsPlugin[], frontmatter: Record<string, unknown>) {
  for (const plugin of plugins) {
    for (const field of plugin.editor?.fields || []) {
      if (!Object.hasOwn(frontmatter, field.key))
        continue
      const value = frontmatter[field.key]
      let valid: boolean
      switch (field.type) {
        case 'boolean':
          valid = typeof value === 'boolean'
          break
        case 'number':
          valid = typeof value === 'number' && Number.isFinite(value) && (field.min === undefined || value >= field.min) && (field.max === undefined || value <= field.max)
          break
        case 'select':
          valid = field.options.some(option => option.value === value)
          break
        default: valid = typeof value === 'string' && (field.maxLength === undefined || value.length <= field.maxLength)
      }
      if (!valid)
        throw new Error(`${plugin.name}: invalid value for ${field.label} (${field.key})`)
    }
  }
}

export function createManifest(plugins: ValaxyDevtoolsPlugin[], base?: string): ValaxyDevtoolsManifest {
  return {
    apiVersion: 1,
    plugins: plugins.map(plugin => ({
      id: plugin.id,
      name: plugin.name,
      panels: (plugin.panels || []).map(panel => ({ id: `valaxy:addon:${plugin.id}:${panel.id}`, title: panel.title, icon: panel.icon || 'ph:puzzle-piece', url: `${resolveAddonBase(base)}${plugin.id}/${panel.id}/` })),
      fields: plugin.editor?.fields || [],
      actions: (plugin.editor?.actions || []).map(action => ({ id: `${plugin.id}:${action.id}`, label: action.label })),
    })),
  }
}

export async function setupExtensions(ctx: DevframeNodeContext, plugins: ValaxyDevtoolsPlugin[], manifest: ValaxyDevtoolsManifest, data: ValaxyDevtoolsData, onDispose: (cleanup: () => void | Promise<void>) => void) {
  for (const [index, plugin] of plugins.entries()) {
    for (const [panelIndex, panel] of (plugin.panels || []).entries()) {
      const view = manifest.plugins[index].panels[panelIndex]
      // The same authenticated connection is discoverable from a directly opened panel.
      await ctx.host.mountConnectionMeta?.(view.url)
      await ctx.host.mountStatic(view.url, panel.clientAssets)
    }
    await plugin.setup?.({ data, rpc: ctx.scope(`valaxy:addon:${plugin.id}`).rpc, onDispose })
  }
}

export function createDataApi(ctx: DevframeNodeContext, functions: Omit<ValaxyDevtoolsData, 'onChanged'>, onDispose: (cleanup: () => void) => void): ValaxyDevtoolsData {
  return {
    ...functions,
    async onChanged(listener) {
      const state = await ctx.rpc.sharedState.get<ResourceState>(RESOURCES_STATE)
      const stop = state.on('updated', listener)
      onDispose(stop)
      return stop
    },
  }
}
