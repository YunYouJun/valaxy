import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getCreatedTime, getUpdatedTime } from '../packages/valaxy/node/utils/date'
import { getGitTimestamp } from '../packages/valaxy/node/utils/getGitTimestamp'

const CREATED_AT = '2024-01-01T10:00:00+08:00'
const UPDATED_AT = '2024-06-01T10:00:00+08:00'

let repoDir: string
let originalCwd: string

function git(args: string[], env: Record<string, string> = {}) {
  execFileSync('git', ['-c', 'commit.gpgsign=false', ...args], {
    cwd: repoDir,
    env: { ...process.env, ...env },
    stdio: 'pipe',
  })
}

function commit(message: string, date: string) {
  git(['add', 'post.md'])
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
  originalCwd = process.cwd()
  repoDir = mkdtempSync(join(tmpdir(), 'valaxy-git-timestamp-'))
  git(['init'])
  writeFileSync(join(repoDir, 'post.md'), '# post\n')
  commit('create post', CREATED_AT)
  writeFileSync(join(repoDir, 'post.md'), '# post\n\nupdated\n')
  commit('update post', UPDATED_AT)
  // `getGitTimestamp` runs git in the current working directory
  process.chdir(repoDir)
})

afterAll(() => {
  process.chdir(originalCwd)
  rmSync(repoDir, { recursive: true, force: true })
})

describe('getGitTimestamp', () => {
  it('reads the newest commit for `updated`', async () => {
    expect(await getGitTimestamp('post.md', 'updated')).toBe(+new Date(UPDATED_AT))
  })

  it('reads the oldest commit for `created`', async () => {
    expect(await getGitTimestamp('post.md', 'created')).toBe(+new Date(CREATED_AT))
  })
})

describe('date utils', () => {
  it('getCreatedTime uses the created time from git', async () => {
    expect(+new Date(await getCreatedTime('post.md'))).toBe(+new Date(CREATED_AT))
  })

  it('getUpdatedTime uses the updated time from git', async () => {
    expect(+new Date(await getUpdatedTime('post.md'))).toBe(+new Date(UPDATED_AT))
  })
})
