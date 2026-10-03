import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { packages, templates } from './utils'

export function isReleaseVersion(version: string): boolean {
  if (!/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Z.-]+)?$/i.test(version))
    return false
  const prerelease = version.split('-').slice(1).join('-')
  return !prerelease || !prerelease.split('.').some(part => !part || (/^\d+$/.test(part) && part.length > 1 && part.startsWith('0')))
}

export const releaseFiles = ['package.json', ...packages.map(name => `packages/${name}/package.json`)]

/** Check the coordinated packages and scaffold before creating a release tag. */
export async function checkReleaseVersions(root: string, tag?: string): Promise<string> {
  const manifests = await Promise.all(releaseFiles.map(async file => ({
    file,
    pkg: JSON.parse(await readFile(resolve(root, file), 'utf8')),
  })))
  const version = manifests[0].pkg.version as string
  if (!isReleaseVersion(version))
    throw new Error(`Invalid release version: ${version}`)
  for (const { file, pkg } of manifests) {
    if (pkg.version !== version)
      throw new Error(`${file} has version ${pkg.version}; expected ${version}`)
  }
  if (tag && tag !== `v${version}`)
    throw new Error(`Release tag ${tag} does not match v${version}`)
  const names = new Set(manifests.slice(1).map(({ pkg }) => pkg.name))
  for (const template of templates) {
    const pkg = JSON.parse(await readFile(resolve(root, template, 'package.json'), 'utf8'))
    for (const deps of [pkg.dependencies, pkg.devDependencies]) {
      for (const [name, range] of Object.entries(deps || {})) {
        if (names.has(name) && range !== version)
          throw new Error(`${template} requires ${name}@${range}; expected ${version}`)
      }
    }
  }
  return version
}
