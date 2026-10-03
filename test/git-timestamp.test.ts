import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { getCreatedTime, getUpdatedTime } from '../packages/valaxy/node/utils/date'
import { getGitTimestamp } from '../packages/valaxy/node/utils/getGitTimestamp'

const CREATED_AT = '2024-01-01T10:00:00+08:00'
const UPDATED_AT = '2024-06-01T10:00:00+08:00'

let repoDir: string
let post: string

function git(args: string[], env: Record<string, string> = {}) {
  execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], {
    cwd: repoDir,
    env: { ...process.env, ...env },
    stdio: 'pipe',
  })
}

function commit(message: string, date: string, file = 'post.md') {
  git(['add', '--', file])
  git(['commit', '-m', message], {
    GIT_AUTHOR_DATE: date,
    GIT_COMMITTER_DATE: date,
    GIT_AUTHOR_NAME: 'valaxy test',
    GIT_AUTHOR_EMAIL: 'test@valaxy.site',
    GIT_COMMITTER_NAME: 'valaxy test',
    GIT_COMMITTER_EMAIL: 'test@valaxy.site',
  })
}

beforeAll(() => {
  repoDir = mkdtempSync(join(tmpdir(), 'valaxy-git-timestamp-'))
  post = join(repoDir, 'post.md')
  git(['init'])
  writeFileSync(post, '# post\n')
  commit('create post', CREATED_AT)
  writeFileSync(post, '# post\n\nupdated\n')
  commit('update post', UPDATED_AT)
})

afterAll(() => {
  rmSync(repoDir, { recursive: true, force: true })
})

describe('getGitTimestamp', () => {
  it('reads the newest commit for `updated`', async () => {
    // The temporary repository is separate from the test runner's working directory.
    expect(await getGitTimestamp(post)).toBe(+new Date(UPDATED_AT))
  })

  it('reads the oldest commit for `created`', async () => {
    expect(await getGitTimestamp(post, 'created')).toBe(+new Date(CREATED_AT))
  })

  it('treats spaces, Unicode, leading dashes and pathspec characters literally', async () => {
    const name = '-文章 [1].md'
    const file = join(repoDir, name)
    writeFileSync(file, '# literal path\n')
    commit('create literal path', CREATED_AT, name)
    writeFileSync(join(repoDir, '-文章 1.md'), '# different file\n')
    commit('create matching pathspec', UPDATED_AT, '-文章 1.md')
    expect(await getGitTimestamp(file)).toBe(+new Date(CREATED_AT))
  })

  it('keeps the creation time across a rename in a nested directory', async () => {
    const original = 'original.md'
    const renamed = 'nested/renamed.md'
    writeFileSync(join(repoDir, original), '# renamed post\n')
    commit('create renamed post', CREATED_AT, original)
    mkdirSync(join(repoDir, 'nested'))
    git(['mv', original, renamed])
    commit('rename post', UPDATED_AT, renamed)
    expect(await getGitTimestamp(join(repoDir, renamed), 'created')).toBe(+new Date(CREATED_AT))
    expect(await getGitTimestamp(join(repoDir, renamed), 'updated')).toBe(+new Date(UPDATED_AT))
  })

  it('returns no timestamp for an untracked file', async () => {
    const file = join(repoDir, 'untracked.md')
    writeFileSync(file, '# untracked\n')
    expect(await getGitTimestamp(file)).toBe(0)
  })

  it('ignores uncommitted changes when Git history is available', async () => {
    writeFileSync(post, '# uncommitted change\n')
    expect(await getGitTimestamp(post)).toBe(+new Date(UPDATED_AT))
  })
})

describe('date utils', () => {
  it('getCreatedTime uses the created time from git', async () => {
    expect(+new Date(await getCreatedTime(post))).toBe(+new Date(CREATED_AT))
  })

  it('getUpdatedTime uses the updated time from git', async () => {
    expect(+new Date(await getUpdatedTime(post))).toBe(+new Date(UPDATED_AT))
  })

  it('preserves filesystem fallback for untracked files', async () => {
    const file = join(repoDir, 'fallback.md')
    writeFileSync(file, '# fallback\n')
    utimesSync(file, new Date(CREATED_AT), new Date(CREATED_AT))
    const stat = statSync(file)
    expect(+new Date(await getCreatedTime(file))).toBe(+stat.ctime)
    expect(+new Date(await getUpdatedTime(file))).toBe(+stat.mtime)
  })

  it('preserves filesystem fallback outside Git repositories', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'valaxy-no-git-'))
    try {
      const file = join(directory, 'post.md')
      writeFileSync(file, '# outside Git\n')
      const stat = statSync(file)
      expect(+new Date(await getCreatedTime(file))).toBe(+stat.ctime)
      expect(+new Date(await getUpdatedTime(file))).toBe(+stat.mtime)
    }
    finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('preserves filesystem fallback when Git is unavailable', async () => {
    const stat = statSync(post)
    vi.stubEnv('PATH', join(repoDir, 'no-executables'))
    try {
      expect(+new Date(await getCreatedTime(post))).toBe(+stat.ctime)
      expect(+new Date(await getUpdatedTime(post))).toBe(+stat.mtime)
    }
    finally {
      vi.unstubAllEnvs()
    }
  })
})
