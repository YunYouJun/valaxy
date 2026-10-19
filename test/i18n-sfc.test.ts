import type { ViteDevServer } from 'vite'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import Vue from '@vitejs/plugin-vue'
import { createServer } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { renderToString } from 'vue/server-renderer'
import VueI18n from '../packages/valaxy/node/plugins/i18n'

const roots: string[] = []
const servers: ViteDevServer[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => server.close()))
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function write(root: string, path: string, source: string) {
  const file = join(root, path)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, source)
  return file.replace(/\\/g, '/')
}

const script = `<script setup>
import { useI18n } from 'vue-i18n'
const { t } = useI18n({ useScope: 'local' })
</script>
<template><p>{{ t('hello') }}</p></template>
`

describe('sFC <i18n> custom blocks', () => {
  it('compiles inline and src-imported locale blocks', async () => {
    // Inside the repo so the fixture SFCs resolve `vue-i18n` from the workspace.
    const root = await mkdtemp(join(import.meta.dirname, '.i18n-sfc-'))
    roots.push(root)
    const inline = await write(root, 'Inline.vue', `${script}<i18n lang="json">{ "en": { "hello": "Inline" } }</i18n>\n`)
    await write(root, 'locales/sidecar.json', '{ "en": { "hello": "Sidecar" } }')
    const sidecar = await write(root, 'Sidecar.vue', `${script}<i18n src="./locales/sidecar.json"></i18n>\n`)
    await write(root, 'locales/sidecar.yml', 'en:\n  hello: Sidecar YAML\n')
    const sidecarYaml = await write(root, 'SidecarYaml.vue', `${script}<i18n lang="yaml" src="./locales/sidecar.yml"></i18n>\n`)

    const server = await createServer({
      configFile: false,
      root,
      plugins: [Vue(), VueI18n({ runtimeOnly: true, compositionOnly: true, fullInstall: true, ssr: true })],
      server: { watch: null },
      logLevel: 'silent',
    })
    servers.push(server)

    const render = async (file: string) => {
      const { default: component } = await server.ssrLoadModule(file)
      const app = createSSRApp(component)
      app.use(createI18n({ legacy: false, locale: 'en' }))
      return renderToString(app)
    }

    expect(await render(inline)).toBe('<p>Inline</p>')
    expect(await render(sidecar)).toBe('<p>Sidecar</p>')
    expect(await render(sidecarYaml)).toBe('<p>Sidecar YAML</p>')
  })
})
