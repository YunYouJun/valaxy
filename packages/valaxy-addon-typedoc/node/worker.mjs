import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import process from 'node:process'
import { Application, Converter } from 'typedoc'
import ts from 'typescript'

async function main() {
  // A short-lived process releases the compiler's AST before Vite starts bundling.
  const [options, out, navigationJson, resultFile, publicPath] = process.argv.slice(2)
  const require = createRequire(import.meta.url)
  const app = await Application.bootstrapWithPlugins({
    options,
    plugin: [require.resolve('typedoc-plugin-markdown')],
    out,
    readme: 'none',
    includeVersion: true,
    githubPages: false,
    entryFileName: 'index.md',
    hidePageHeader: true,
    hideBreadcrumbs: true,
    useCodeBlocks: true,
    // Normal heading IDs remain compatible with the old site. Symbol links use
    // a separate namespace, avoiding collisions with comment headings.
    useCustomAnchors: false,
    useHTMLAnchors: true,
    anchorPrefix: 'api-',
    navigationJson,
    publicPath,
  })
  const files = new Set()
  app.converter.on(Converter.EVENT_BEGIN, (context) => {
    for (const program of context.programs) {
      for (const file of program.getSourceFiles())
        files.add(file.fileName)
    }
  })
  const tsconfig = app.options.getValue('tsconfig')
  if (tsconfig) {
    ts.getParsedCommandLineOfConfigFile(tsconfig, {}, {
      ...ts.sys,
      readFile(file) {
        files.add(file)
        return ts.sys.readFile(file)
      },
      onUnRecoverableConfigFileDiagnostic: diagnostic => app.logger.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')),
    })
  }
  const project = await app.convert()
  if (!project || app.logger.hasErrors())
    throw new Error('[typedoc] TypeScript conversion failed; previous pages were preserved.')
  app.validate(project)
  if (app.logger.hasErrors())
    throw new Error('[typedoc] Reference validation failed.')
  await app.generateOutputs(project)
  if (app.logger.hasErrors())
    throw new Error('[typedoc] Markdown generation failed.')
  await writeFile(resultFile, JSON.stringify({ files: [...files], version: project.packageVersion }))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
