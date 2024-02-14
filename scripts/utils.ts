import { join } from 'node:path'
import { readFile, writeFile } from 'node:fs/promises'
import consola from 'consola'
import { cyan, gray, yellow } from 'picocolors'

export const packages = [
  // @valaxyjs/devtools
  'devtools',

  'create-valaxy',
  'valaxy',
  'valaxy-theme-press',
  'valaxy-theme-yun',
]

export const templates = [
  'packages/create-valaxy/template-blog',
]

export async function updateTemplateVersions(version: string) {
  for (const template of templates) {
    const pkgPath = join(template, 'package.json')
    const pkg = JSON.parse(await readFile(pkgPath, 'utf-8'))
    const deps = ['dependencies', 'devDependencies']
    for (const name of deps) {
      if (!pkg[name])
        continue

      for (const key in pkg[name]) {
        if (packages.includes(key)) {
          consola.info(`${cyan(key)} ${gray(`v${pkg[name][key]}`)} -> ${yellow(`v${version}`)}`)
          pkg[name][key] = version
        }
      }
    }
    await writeFile(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}
