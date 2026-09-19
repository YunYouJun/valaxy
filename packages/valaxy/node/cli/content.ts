import type { Argv } from 'yargs'
import process from 'node:process'
import { consola } from 'consola'
import { resolve } from 'pathe'
import { mergeConfig } from 'vite'
import { createValaxyNode } from '../app'
import { mergeViteConfigs } from '../common'
import { createContentService } from '../content'
import { logger, setLogLevel } from '../logger'
import { resolveOptions } from '../options'
import { setEnv, setTimezone } from '../utils/env'
import { commonOptions } from './options'

/** Article diagnostics also work without an MCP client or a running dev server. */
export function registerContentCommands(cli: Argv) {
  for (const command of ['inspect', 'check'] as const) {
    cli.command(
      `${command} [root]`,
      command === 'inspect' ? 'Inspect resolved article routes and metadata' : 'Check article metadata, routes and local links',
      args => commonOptions(args)
        .option('file', { type: 'string', demandOption: true, describe: 'Site-relative Markdown path, e.g. pages/posts/hello.md' })
        .option('json', { type: 'boolean', default: false, describe: 'Output structured JSON' })
        .strict(),
      async ({ root, file, json }) => {
        const logLevel = consola.level
        const loggerLevel = logger.level
        let service: ReturnType<typeof createContentService> | undefined
        try {
          setEnv()
          if (json)
            setLogLevel(-999)
          const options = await resolveOptions({ userRoot: resolve(root) })
          setTimezone(options.config.siteConfig.timezone)
          const app = createValaxyNode(options)
          if (options.config.loaders?.length) {
            const { loadAllContent } = await import('../modules/content')
            await app.hooks.callHook('content:before-load')
            await loadAllContent(options.config.loaders, { node: app, cacheDir: resolve(options.tempDir, 'content'), mode: 'dev' })
            await app.hooks.callHook('content:loaded')
          }
          const vite = mergeConfig(await mergeViteConfigs(options, 'serve'), options.config.vite || {})
          service = createContentService(app, {
            base: vite.base,
            publicDir: vite.publicDir === false ? false : resolve(options.userRoot, vite.publicDir || 'public'),
          })
          const result = command === 'inspect' ? await service.inspectPage(file) : await service.checkPage(file)
          if ('ok' in result && !result.ok)
            process.exitCode = 1
          if (json || !('diagnostics' in result)) {
            console.log(JSON.stringify(result, null, 2))
          }
          else {
            console.log(`${result.path}: ${result.ok ? 'passed' : 'failed'} (${result.totalDiagnostics} diagnostics)`)
            for (const diagnostic of result.diagnostics)
              console.log(`  ${diagnostic.severity} ${diagnostic.code}${diagnostic.line ? `:${diagnostic.line}` : ''}: ${diagnostic.message}\n    ${diagnostic.hint}`)
          }
        }
        catch (error) {
          process.exitCode = 1
          const message = error instanceof Error ? error.message : 'Content inspection failed'
          if (json)
            console.log(JSON.stringify({ path: file, ok: false, error: message }))
          else
            console.error(message)
        }
        finally {
          consola.level = logLevel
          logger.level = loggerLevel
          await service?.dispose()
        }
      },
    )
  }
}
