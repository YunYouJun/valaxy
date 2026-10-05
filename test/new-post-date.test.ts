import { spawnSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import process from 'node:process'
import { expect, it, vi } from 'vitest'
import { create } from '../packages/valaxy/node/cli/utils/post'

vi.mock('../packages/valaxy/node/cli/utils/scaffold', () => ({ getTemplate: async () => false }))

it('generates a publication instant that sorts identically in every visitor timezone', async () => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-post-date-'))
  const now = new Date('2026-10-04T22:30:00Z')
  vi.useFakeTimers()
  vi.setSystemTime(now)
  try {
    const file = await create({ title: 'first-post', path: root, date: true })
    const markdown = await readFile(file, 'utf8')
    const date = markdown.match(/^date: (.+)$/m)![1]
    for (const timezone of ['UTC', 'Asia/Shanghai', 'America/Los_Angeles']) {
      const result = spawnSync(process.execPath, ['-e', `process.stdout.write(String(new Date(${JSON.stringify(date)}).getTime()))`], {
        env: { ...process.env, TZ: timezone },
        encoding: 'utf8',
      })
      expect(result.status, result.stderr).toBe(0)
      expect(Number(result.stdout), timezone).toBe(now.getTime())
    }
  }
  finally {
    vi.useRealTimers()
    await rm(root, { recursive: true, force: true })
  }
})
