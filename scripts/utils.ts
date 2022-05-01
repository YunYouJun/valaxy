import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import type { ReleaseType } from 'semver'
import semver from 'semver'
import consola from 'consola'
import chalk from 'chalk'

export const packages = [
  'valaxy',
  'valaxy-theme-yun',
  'create-valaxy',
  // todo
  // 'create-valaxy-theme'
]

export const templates = [
  'packages/create-valaxy/template',
]

export function updateTemplateVersions(version: string) {
  for (const template of templates) {
    const pkgPath = join(template, 'package.json')
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
    const deps = ['dependencies', 'devDependencies']
    for (const name of deps) {
      if (!pkg[name])
        continue

      for (const key in pkg[name]) {
        if (packages.includes(key)) {
          consola.info(`${chalk.cyan(key)} ${chalk.gray(`v${pkg[name][key]}`)} -> ${chalk.yellow(`v${version}`)}`)
          pkg[name][key] = version
        }
      }
    }
    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
  }
}

export function updateVersion(pkgPath: string, version: string): void {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  consola.info(`${chalk.cyan(pkg.name)} ${chalk.gray(`v${pkg.version}`)} -> ${chalk.yellow(`v${version}`)}`)
  pkg.version = version
  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
}

export function getVersionChoices(currentVersion: string) {
  const currentBeta = currentVersion.includes('beta')

  const inc: (i: ReleaseType) => string = i =>
    semver.inc(currentVersion, i)!

  const versionChoices = [
    {
      title: 'next',
      value: inc(currentBeta ? 'prerelease' : 'patch'),
    },
    ...(currentBeta
      ? [
          {
            title: 'stable',
            value: inc('patch'),
          },
        ]
      : [
          {
            title: 'beta-minor',
            value: inc('preminor'),
          },
          {
            title: 'beta-major',
            value: inc('premajor'),
          },
          {
            title: 'minor',
            value: inc('minor'),
          },
          {
            title: 'major',
            value: inc('major'),
          },
        ]),
    { value: 'custom', title: 'custom' },
  ].map((i) => {
    i.title = `${i.title} (${i.value})`
    return i
  })

  return versionChoices
}
