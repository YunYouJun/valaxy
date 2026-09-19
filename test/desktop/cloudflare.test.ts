import { describe, expect, it, vi } from 'vitest'
import { CloudflarePublisher } from '../../packages/desktop/src/main/cloudflare'

const accountId = 'a'.repeat(32)
const target = { accountId, name: 'my-blog', url: 'https://my-blog-abc.pages.dev/', branch: 'production' }
const project = { name: 'my-blog', subdomain: 'my-blog-abc.pages.dev', production_branch: 'production', canonical_deployment: { url: 'https://123.my-blog-abc.pages.dev', latest_stage: { status: 'success' } } }

function setup() {
  const run = vi.fn(async (args: string[]) => {
    if (args[0] === 'whoami')
      return JSON.stringify({ loggedIn: true, accounts: [{ id: accountId, name: 'Personal' }] })
    if (args[0] === 'auth')
      return JSON.stringify({ type: 'oauth', token: 'test-token' })
    return `Deployment complete! ${project.canonical_deployment.url}`
  })
  const request = vi.fn(async () => new Response(JSON.stringify({ success: true, result: project })))
  return { run, request, publisher: new CloudflarePublisher(run, request) }
}

describe('desktop Pages publishing', () => {
  it('uses the assigned domain and existing production branch', async () => {
    const { publisher, run } = setup()
    expect(await publisher.connect(accountId, 'my-blog')).toEqual(target)
    expect(run).not.toHaveBeenCalledWith(expect.arrayContaining(['create']), expect.anything())
  })

  it('creates a missing project only after explicit connection', async () => {
    const { publisher, request, run } = setup()
    request.mockResolvedValueOnce(new Response('', { status: 404 }))
    await publisher.connect(accountId, 'my-blog')
    expect(run).toHaveBeenCalledWith(['pages', 'project', 'create', 'my-blog', '--production-branch', 'main'], accountId)
  })

  it('rejects account and project injection before network access', async () => {
    const { publisher, request } = setup()
    await expect(publisher.connect('../../other', 'my-blog')).rejects.toThrow()
    await expect(publisher.connect(accountId, '--bad')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })

  it('reports success only for the deployment uploaded in this attempt', async () => {
    const { publisher, run } = setup()
    expect(await publisher.publish(target, '/blog/dist')).toBe(target.url)
    expect(run).toHaveBeenCalledWith(['pages', 'deploy', '/blog/dist', '--project-name', 'my-blog', '--branch', 'production', '--commit-dirty=true'], accountId)
    run.mockImplementationOnce(async () => 'https://different.my-blog.pages.dev')
    await expect(publisher.publish(target, '/blog/dist')).rejects.toThrow('尚未确认')
  })

  it('does not report a failed upload or expired authorization as published', async () => {
    const { publisher, run } = setup()
    run.mockRejectedValueOnce(new Error('Upload failed'))
    await expect(publisher.publish(target, '/blog/dist')).rejects.toThrow('Upload failed')
    run.mockRejectedValueOnce(new Error('Authorization expired'))
    await expect(publisher.accounts()).rejects.toThrow('Authorization expired')
  })
})
