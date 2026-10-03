import type { VersionBumpOptions } from 'bumpp'
import { execFileSync, spawnSync } from 'node:child_process'
import process from 'node:process'
import { versionBump } from 'bumpp'
import { consola } from 'consola'
import minimist from 'minimist'
import { checkReleaseVersions, isReleaseVersion, releaseFiles } from './release-check'
import { updateTemplateVersions } from './utils'

const args = minimist(process.argv.slice(2), { boolean: ['prepare', 'publish', 'dry'], string: ['version'] })

function git(...args: string[]): string {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function assertClean() {
  if (git('status', '--porcelain'))
    throw new Error('Commit or stash all changes before preparing or publishing a release')
}

function pnpm(...args: string[]) {
  const cli = process.env.npm_execpath
  // pnpm 12 can expose a native executable as npm_execpath.
  const result = cli && /\.[cm]?js$/.test(cli)
    ? spawnSync(process.execPath, [cli, ...args], { stdio: 'inherit' })
    : spawnSync(cli || 'pnpm', args, { stdio: 'inherit', shell: process.platform === 'win32' && (!cli || /\.cmd$/i.test(cli)) })
  if (result.error)
    throw result.error
  if (result.status !== 0)
    throw new Error(`pnpm ${args.join(' ')} failed (${result.status ?? result.signal})`)
}

async function main() {
  assertClean()
  if (args.publish) {
    const current = await checkReleaseVersions(process.cwd())
    if (args.prepare || args.dry || args.version || args._.length)
      throw new Error('--publish tags the committed version; it cannot also prepare a version')
    if (git('branch', '--show-current') !== 'main')
      throw new Error('Publish only from the reviewed main branch')
    const head = git('rev-parse', 'HEAD')
    const remote = git('ls-remote', 'origin', 'refs/heads/main').split(/\s/)[0]
    if (remote !== head)
      throw new Error('Local main must match origin/main before publishing')
    const tag = `v${current}`
    if (spawnSync('git', ['show-ref', '--verify', '--quiet', `refs/tags/${tag}`]).status === 0
      || git('ls-remote', 'origin', `refs/tags/${tag}`)) {
      throw new Error(`Release tag ${tag} already exists`)
    }
    pnpm('run', 'check:release')
    assertClean()
    if (git('rev-parse', 'HEAD') !== head)
      throw new Error('HEAD changed during release verification')
    git('tag', '-a', tag, '-m', `Release ${tag}`)
    // One atomic push publishes only this reviewed commit and this exact tag.
    git('push', '--atomic', 'origin', 'HEAD:refs/heads/main', `refs/tags/${tag}`)
    consola.success(`Pushed ${tag}; monitor the Release workflow before announcing availability`)
    return
  }

  const requested = args.version || args._[0]
  if (args._.length > 1 || (requested && !isReleaseVersion(requested)))
    throw new Error('Specify an exact version, for example: pnpm release --prepare 1.0.0')
  const { newVersion } = await versionBump({
    release: (requested || 'prompt') as VersionBumpOptions['release'],
    confirm: !requested,
    commit: false,
    push: false,
    tag: false,
    ignoreScripts: true,
    files: releaseFiles,
  })
  await updateTemplateVersions(newVersion)
  pnpm('install', '--lockfile-only', '--ignore-scripts')
  await checkReleaseVersions(process.cwd())
  consola.success(`Prepared v${newVersion}. Review the diff, run pnpm check:release and merge it before pnpm release --publish`)
}

main().catch((error) => {
  consola.error(error)
  process.exitCode = 1
})
