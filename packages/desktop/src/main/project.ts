import type { DesktopProject } from '../shared/types'
import { readFile, realpath, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { basename, join } from 'node:path'

/**
 * Inspect an existing project without executing its configuration.
 * @param directory - Directory selected by the user.
 * @returns Project metadata and the installed framework version.
 * @throws When pages, dependencies, or the manifest are missing.
 */
export async function inspectProject(directory: string): Promise<DesktopProject> {
  const root = await realpath(directory)
  let manifest
  try {
    manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  }
  catch {
    throw new Error('请选择包含 package.json 的 Valaxy 项目目录。')
  }
  if (!manifest.dependencies?.valaxy && !manifest.devDependencies?.valaxy)
    throw new Error('这个项目没有声明 valaxy 依赖。请选择博客项目目录。')
  if (!await stat(join(root, 'pages')).then(value => value.isDirectory()).catch(() => false))
    throw new Error('没有找到 pages 目录。请选择博客项目目录。')

  const require = createRequire(join(root, 'package.json'))
  let version: string
  let dependenciesReady = true
  try {
    const packageFile = require.resolve('valaxy/package.json')
    version = JSON.parse(await readFile(packageFile, 'utf8')).version
    await stat(require.resolve('valaxy'))
  }
  catch {
    version = '待安装'
    dependenciesReady = false
  }
  return { root, name: typeof manifest.name === 'string' ? manifest.name : basename(root), version, dependenciesReady }
}
