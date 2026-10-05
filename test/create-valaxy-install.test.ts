import type { Buffer } from 'node:buffer'
import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { expect, it } from 'vitest'

const exec = promisify(execFile)

it('installs with strict build approval using only the starter permissions', async () => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-install-'))
  const dependencies: Record<string, string> = {}
  const archives = new Map<string, Buffer>()
  let origin: string
  const registry = createServer(async (request, response) => {
    const name = decodeURIComponent(request.url!.slice(1))
    if (archives.has(name)) {
      response.setHeader('content-type', 'application/json')
      response.end(JSON.stringify({
        name,
        'dist-tags': { latest: '1.0.0' },
        'time': { '1.0.0': '2020-01-01T00:00:00.000Z' },
        'versions': {
          '1.0.0': { name, version: '1.0.0', dist: { tarball: `${origin}/${encodeURIComponent(name)}.tgz` } },
        },
      }))
    }
    else if (archives.has(name.replace(/\.tgz$/, ''))) {
      response.end(archives.get(name.replace(/\.tgz$/, '')))
    }
    else {
      response.writeHead(404).end()
    }
  })
  try {
    // A loopback registry exercises real install policy without contacting npm
    // or running upstream scripts. Each stand-in only writes its own marker.
    for (const name of ['esbuild', 'vue-demi', '@parcel/watcher']) {
      const dir = join(root, 'fixtures', name)
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, 'package.json'), JSON.stringify({
        name,
        version: '1.0.0',
        scripts: { postinstall: 'node install.cjs' },
      }))
      await writeFile(join(dir, 'install.cjs'), `require('node:fs').writeFileSync(${JSON.stringify(join(root, `${name.replace(/[@/]/g, '-')}.built`))}, 'built')`)
      const archive = join(dir, 'fixture.tgz')
      await exec('pnpm', ['pack', '--out', archive], { cwd: dir, timeout: 30_000 })
      archives.set(name, await readFile(archive))
      dependencies[name] = '1.0.0'
    }
    await new Promise<void>(resolve => registry.listen(0, '127.0.0.1', resolve))
    const address = registry.address()
    if (!address || typeof address === 'string')
      throw new Error('Registry did not start')
    origin = `http://127.0.0.1:${address.port}`
    const install = () => exec('pnpm', ['install', '--registry', origin], { cwd: root, timeout: 30_000 })
    await writeFile(join(root, 'package.json'), JSON.stringify({ name: 'install-fixture', private: true, dependencies }))
    // Reproduce the original failure even on pnpm 10, where this is opt-in.
    await writeFile(join(root, 'pnpm-workspace.yaml'), 'strictDepBuilds: true\n')
    await expect(install()).rejects.toThrow('IGNORED_BUILDS')
    await rm(join(root, 'node_modules'), { recursive: true, force: true })
    const config = await readFile(resolve('packages/create-valaxy/template-blog/pnpm-workspace.yaml'), 'utf8')
    await writeFile(join(root, 'pnpm-workspace.yaml'), `${config}\nstrictDepBuilds: true\n`)
    await install()
    for (const name of ['esbuild', 'vue-demi'])
      expect(await readFile(join(root, `${name}.built`), 'utf8')).toBe('built')
    await expect(readFile(join(root, '-parcel-watcher.built'))).rejects.toMatchObject({ code: 'ENOENT' })
  }
  finally {
    registry.closeAllConnections()
    await new Promise<void>(resolve => registry.close(() => resolve()))
    await rm(root, { recursive: true, force: true })
  }
}, 90_000)
